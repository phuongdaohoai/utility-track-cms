import { useState, useEffect, type FC } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { createGuestCheckIn, type CreateCheckInDto } from '../../api/checkin.api'

interface Person {
  id: string
  name: string
}

interface LocationState {
  serviceId: number
  serviceName: string
}

export const CheckInOutside: FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null

  const [representative, setRepresentative] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [people, setPeople] = useState<Person[]>([{ id: '1', name: '' }])
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

  // Không cần tải danh sách dịch vụ nữa vì đã chọn từ trang trước

  const handleAddPerson = () => {
    const newPerson: Person = {
      id: Date.now().toString(),
      name: '',
    }
    setPeople([...people, newPerson])
  }

  const handlePersonNameChange = (id: string, name: string) => {
    setPeople(people.map((p) => (p.id === id ? { ...p, name } : p)))
  }

  const handleCheckin = async () => {
    // Validation
    if (!phone || phone.trim() === '') {
      setError('Vui lòng nhập số điện thoại')
      return
    }

    if (!serviceId) {
      setError('Không có dịch vụ được chọn. Vui lòng quay lại chọn dịch vụ.')
      return
    }

    // Lấy tên đại diện (người đầu tiên trong danh sách hoặc representative)
    const guestName = people.length > 0 && people[0].name
      ? people.map(p => p.name).filter(Boolean).join(', ')
      : representative || 'Khách vãng lai'

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
        setSuccess(result.message || 'Check-in thành công!')
        // Reset form sau 2 giây và quay về trang chọn dịch vụ
        setTimeout(() => {
          navigate('/select-service-guest')
        }, 2000)
      } else if (result.status === 'CHECK_OUT') {
        setSuccess(result.message || 'Check-out thành công!')
      }
    } catch (err: any) {
      console.error('Lỗi check-in:', err)
      console.error('Chi tiết lỗi:', {
        message: err?.message,
        response: err?.response,
        status: err?.response?.status,
      })
      
      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMessage = err?.message || 'Có lỗi xảy ra khi check-in. Vui lòng thử lại.'
      
      // Nếu là lỗi network hoặc endpoint không tồn tại
      if (err?.message?.includes('Cannot POST') || err?.message?.includes('404')) {
        errorMessage = 'Endpoint API không đúng. Vui lòng kiểm tra lại cấu hình backend.'
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
              <label className="w-48 text-gray-700 font-medium">Đại Diện</label>
              <input
                type="text"
                value={representative}
                onChange={(e) => setRepresentative(e.target.value)}
                placeholder="Nguyễn A"
                className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded"
              />
            </div>

            {/* Số Điện Thoại */}
            <div className="flex items-center">
              <label className="w-48 text-gray-700 font-medium">Số Điện Thoại</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="090000000"
                className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded"
              />
            </div>

            {/* Dịch Vụ (chỉ hiển thị, không cho chọn) */}
            <div className="flex items-center">
              <label className="w-48 text-gray-700 font-medium">Dịch Vụ</label>
              <span className="flex-1 text-gray-700 font-semibold">{serviceName}</span>
            </div>

            {/* Phương Thức Checkin */}
            <div className="flex items-center">
              <label className="w-48 text-gray-700 font-medium">Phương Thức Checkin</label>
              <span className="flex-1 text-gray-700">Thủ Công</span>
            </div>

            {/* Thời Gian Vào */}
            <div className="flex items-center">
              <label className="w-48 text-gray-700 font-medium">Thời Gian Vào</label>
              <span className="flex-1 text-gray-700">{checkinTime}</span>
            </div>

            {/* Số Lượng */}
            <div className="flex items-start">
              <label className="w-48 text-gray-700 font-medium pt-2">Số Lượng</label>
              <div className="flex-1">
                {/* Bảng */}
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">
                        STT
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">
                        Họ Và Tên
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">
                        Hoạt Động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {people.map((person, index) => (
                      <tr key={person.id} className="bg-white">
                        <td className="border border-gray-300 px-4 py-2 text-gray-700">
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <input
                            type="text"
                            value={person.name}
                            onChange={(e) => handlePersonNameChange(person.id, e.target.value)}
                            placeholder="Nguyễn A"
                            className="w-full px-2 py-1 bg-white border-0 outline-none"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <button
                            onClick={handleAddPerson}
                            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Thêm
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                Quay lại
              </button>
              <button
                onClick={handleCheckin}
                disabled={loading}
                className="bg-blue-800 text-white px-16 py-3 rounded-lg font-semibold text-lg hover:bg-blue-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý...' : 'Checkin'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckInOutside

