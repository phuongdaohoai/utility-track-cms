import { useState, useEffect, type FC } from 'react'
import { createGuestCheckIn, type CreateCheckInDto } from '../../api/checkin.api'
import { getServiceById } from '../../api/services.api'
import { QRCodeDisplay } from '../../components/QRCodeDisplay'
import { QRScanner } from '../../components/QRScanner'

interface Person {
  id: string
  name: string
}

interface ServiceInfo {
  id: number
  serviceName: string
  qrToken?: string
}

export const GuestCheckInByQR: FC = () => {
  const [service, setService] = useState<ServiceInfo | null>(null)
  const [representative, setRepresentative] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [people, setPeople] = useState<Person[]>([{ id: '1', name: '' }])
  const [checkinTime, setCheckinTime] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showQRScanner, setShowQRScanner] = useState(false)

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

  // Xử lý khi quét QR code từ service
  const handleServiceQRScan = async (qrData: string) => {
    setShowQRScanner(false)
    setError(null)

    try {
      // QR code có thể chứa serviceId hoặc qrToken
      // Giả định QR code chứa serviceId hoặc qrToken
      // Cần xác nhận format từ backend
      
      // Thử parse như JSON hoặc số
      let serviceId: number | null = null
      try {
        const parsed = JSON.parse(qrData)
        serviceId = parsed.serviceId || parsed.id
      } catch {
        // Nếu không phải JSON, thử parse như số
        const num = parseInt(qrData, 10)
        if (!isNaN(num)) {
          serviceId = num
        }
      }

      if (!serviceId) {
        // Nếu không parse được, có thể là qrToken - cần gọi API để tìm service
        // Tạm thời hiển thị lỗi
        setError('Không thể xác định dịch vụ từ QR code. Vui lòng thử lại.')
        return
      }

      // Lấy thông tin service
      const res = await getServiceById(serviceId)
      const serviceData = res?.data?.data || res?.data || res

      setService({
        id: serviceData.id,
        serviceName: serviceData.serviceName || serviceData.name,
        qrToken: serviceData.qrToken || serviceData.qr_token,
      })
    } catch (err: any) {
      console.error('Lỗi khi tải thông tin dịch vụ:', err)
      setError('Không thể tải thông tin dịch vụ từ QR code.')
    }
  }

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
    if (!service) {
      setError('Vui lòng quét QR code dịch vụ trước')
      return
    }

    if (!phone || phone.trim() === '') {
      setError('Vui lòng nhập số điện thoại')
      return
    }

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
        serviceId: service.id,
      }

      const result = await createGuestCheckIn(checkInData)
      
      if (result.status === 'CHECK_IN') {
        setSuccess(result.message || 'Check-in thành công!')
        setTimeout(() => {
          setRepresentative('')
          setPhone('')
          setPeople([{ id: '1', name: '' }])
          setService(null)
        }, 2000)
      } else if (result.status === 'CHECK_OUT') {
        setSuccess(result.message || 'Check-out thành công!')
      }
    } catch (err: any) {
      console.error('Lỗi check-in:', err)
      setError(err.message || 'Có lỗi xảy ra khi check-in. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // Màn hình chưa quét QR code
  if (!service) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
          <div className="max-w-2xl w-full">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Check-in Khách Ngoài</h1>
              <p className="text-gray-600 mb-6">Quét QR code của dịch vụ để bắt đầu check-in</p>
              
              <button
                onClick={() => setShowQRScanner(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
              >
                Quét QR Code Dịch Vụ
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {showQRScanner && (
          <QRScanner
            onScan={handleServiceQRScan}
            onClose={() => setShowQRScanner(false)}
            title="Quét QR Code Dịch Vụ"
          />
        )}
      </>
    )
  }

  // Màn hình form check-in sau khi quét QR
  return (
    <div className="min-h-screen bg-white p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <div className="border border-gray-300 bg-white p-6 rounded-lg">
          <div className="space-y-4">
            {/* Hiển thị QR code của service (nếu có) */}
            {service.qrToken && (
              <div className="mb-6">
                <QRCodeDisplay 
                  value={service.qrToken} 
                  title={`QR Code - ${service.serviceName}`}
                  size={200}
                />
              </div>
            )}

            {/* Dịch Vụ (đã set sẵn từ QR) */}
            <div className="flex items-center">
              <label className="w-48 text-gray-700 font-medium">Dịch Vụ</label>
              <span className="flex-1 text-gray-700 font-semibold">{service.serviceName}</span>
            </div>

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
                onClick={() => setService(null)}
                className="bg-gray-500 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-600 transition-colors"
              >
                Quét Lại
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

export default GuestCheckInByQR

