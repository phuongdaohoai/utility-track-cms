import { useState, useEffect, type FC } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { createGuestCheckIn, type CreateCheckInDto } from '../../api/checkin.api'
import { useLocale } from '../../i18n/LocaleContext'

interface Person {
  id: string
  name: string
}

interface LocationState {
  serviceId: number
  serviceName: string
}

export const CheckInOutside: FC = () => {
  const { t } = useLocale()
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null

  const [representative, setRepresentative] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [people, setPeople] = useState<Person[]>([]) // Danh sách người đã thêm
  const [newPersonName, setNewPersonName] = useState<string>('') // Input nhập tên mới
  const [checkinTime, setCheckinTime] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Lấy serviceId và serviceName từ location state
  const serviceId = state?.serviceId || null
  const serviceName = state?.serviceName || ''

  // Nếu không có serviceId, redirect về trang chọn dịch vụ
  useEffect(() => {
    if (!serviceId) {
      navigate('/select-service-guest')
    }
  }, [serviceId, navigate])

  // Tự động cập nhật thời gian checkin
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      setCheckinTime(`${year}/${month}/${day} ${hours}:${minutes}:${seconds}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleAddPerson = () => {
    if (!newPersonName.trim()) {
      // Không thêm nếu tên trống
      return
    }
    
    const newPerson: Person = {
      id: Date.now().toString(),
      name: newPersonName.trim(),
    }
    
    setPeople([...people, newPerson])
    setNewPersonName('') // Reset input sau khi thêm
  }

  const handleRemovePerson = (id: string) => {
    setPeople(people.filter((p) => p.id !== id))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddPerson()
    }
  }

  const handleCheckin = async () => {
    // BẮT BUỘC nhập người đại diện
    if (!representative || representative.trim() === '') {
      setError(t.checkInOutside.errorRepresentativeRequired)
      return
    }
    // Validation
    if (!phone || phone.trim() === '') {
      setError(t.checkInOutside.errorPhoneRequired)
      return
    }

    if (!serviceId) {
      setError(t.checkInOutside.errorNoService)
      return
    }

    // Tổng hợp tất cả người (đại diện + danh sách đã thêm)
    const allPeopleNames = [
      representative,
      ...people.map(p => p.name)
    ].filter(Boolean)
    
    const guestName = allPeopleNames.join(', ') || t.checkInOutside.guestName;
    
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const checkInData: CreateCheckInDto = {
        guestName: guestName,
        guestPhone: phone.trim(),
        serviceId: serviceId,
      }

      const result = await createGuestCheckIn(checkInData)

      if (result.status === 'CHECK_IN') {
        setSuccess(result.message || t.checkInOutside.successCheckin)
        // Reset form sau 2 giây và quay về trang chọn dịch vụ
        setTimeout(() => {
          navigate('/select-service-guest')
        }, 2000)
      } else if (result.status === 'CHECK_OUT') {
        setSuccess(result.message || t.checkInOutside.successCheckout)
      }
    } catch (err: any) {
      console.error('Lỗi check-in:', err)
      console.error('Chi tiết lỗi:', {
        message: err?.message,
        response: err?.response,
        status: err?.response?.status,
      })

      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMessage = err?.message || t.checkInOutside.errorCheckin

      // Nếu là lỗi network hoặc endpoint không tồn tại
      if (err?.message?.includes('Cannot POST') || err?.message?.includes('404')) {
        errorMessage = t.checkInOutside.errorEndpoint
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        {/* Form container */}
        <div className="border border-gray-300 bg-white p-6 rounded-lg">
          <div className="space-y-4">
            {/* Đại Diện */}
            <div className="flex items-center">
              <label className="w-48 text-gray-700 font-medium">{t.checkInOutside.representative}</label>
              <input
                type="text"
                value={representative}
                onChange={(e) => setRepresentative(e.target.value)}
                placeholder={t.checkInOutside.placeholderRepresentative}
                className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded"
              />
            </div>

            {/* Số Điện Thoại */}
            <div className="flex items-center">
              <label className="w-48 text-gray-700 font-medium">{t.checkInOutside.phone}</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.checkInOutside.placeholderPhone}
                className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded"
              />
            </div>

            {/* Dịch Vụ (chỉ hiển thị, không cho chọn) */}
            <div className="flex items-center">
              <label className="w-48 text-gray-700 font-medium">{t.checkInOutside.service}</label>
              <span className="flex-1 text-gray-700 font-semibold">{serviceName}</span>
            </div>

            {/* Phương Thức Checkin */}
            <div className="flex items-center">
              <label className="w-48 text-gray-700 font-medium">{t.checkInOutside.checkinMethod}</label>
              <span className="flex-1 text-gray-700">{t.checkInOutside.manual}</span>
            </div>

            {/* Thời Gian Vào */}
            <div className="flex items-center">
              <label className="w-48 text-gray-700 font-medium">{t.checkInOutside.checkinTime}</label>
              <span className="flex-1 text-gray-700">{checkinTime}</span>
            </div>

            {/* Phần thêm người - KHÔNG có label "Số Lượng" */}
            <div className="flex items-start">
              <div className="w-48"></div> {/* Spacer để căn chỉnh với các dòng trên */}
              <div className="flex-1">
                {/* Input để nhập tên người mới */}
                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t.checkInOutside.placeholderName}
                    className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded"
                  />
                  <button
                    onClick={handleAddPerson}
                    disabled={!newPersonName.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-1 hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t.checkInOutside.add}
                  </button>
                </div>

                {/* Bảng hiển thị danh sách đã thêm */}
                {people.length > 0 && (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">
                          {t.checkInOutside.stt}
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">
                          {t.checkInOutside.fullName}
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">
                          {t.checkInOutside.action}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {people.map((person, index) => (
                        <tr key={person.id} className="bg-white">
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">
                            {index + 1}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">
                            {person.name}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <button
                              onClick={() => handleRemovePerson(person.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-red-700 transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <circle cx="12" cy="12" r="10" className="stroke-current" />
                                <line x1="8" y1="12" x2="16" y2="12" className="stroke-current" />
                              </svg>
                              {t.checkInOutside.remove}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Hiển thị thông báo nếu chưa có ai được thêm */}
                {people.length === 0 && (
                  <div className="text-center py-4 text-gray-500 italic">
                    {t.checkInOutside.noPeopleAdded}
                  </div>
                )}
              </div>
            </div>

            {/* Thông báo lỗi/thành công */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}

            {/* Nút Checkin */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => navigate('/select-service-guest')}
                className="bg-gray-500 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-600 transition-colors"
              >
                {t.checkInOutside.back}
              </button>
              <button
                onClick={handleCheckin}
                disabled={loading}
                className="bg-blue-800 text-white px-16 py-3 rounded-lg font-semibold text-lg hover:bg-blue-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? t.checkInOutside.processing : t.checkInOutside.checkin}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckInOutside