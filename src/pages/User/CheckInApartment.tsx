import { useState, useEffect, type FC } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { residentCheckInOrOut, type ResidentCheckInDto } from '../../api/checkin.api'

interface AdditionalGuest {
  id: string
  name: string
}

interface ResidentData {
  id?: number
  fullName?: string
  phone?: string
  email?: string
  apartment?: {
    id?: number
    building?: string
    floorNumber?: number
    roomNumber?: string
  } | string
  qrCode?: string
  [key: string]: any
}

interface LocationState {
  residentData: ResidentData // Thông tin cư dân từ find-resident
  serviceId: number
  serviceName: string
  qrCode?: string
  faceDescriptor?: number[]
}

export const CheckInApartment: FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null

  // Nếu không có dữ liệu từ ScreenCheckIn, quay lại
  useEffect(() => {
    if (!state?.residentData) {
      navigate('/screen-checkin')
    }
  }, [state, navigate])

  const residentData = state?.residentData
  const serviceId = state?.serviceId
  const serviceName = state?.serviceName || ''
  
  // Lấy thông tin căn hộ
  const apartment = typeof residentData?.apartment === 'string' 
    ? residentData.apartment 
    : residentData?.apartment?.roomNumber 
      ? `${residentData.apartment.building || ''}${residentData.apartment.roomNumber || ''}`.trim()
      : ''
  
  const ownerName = residentData?.fullName || ''
  
  // Format thời gian hiện tại
  const now = new Date()
  const checkInTime = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  
  const [additionalGuests, setAdditionalGuests] = useState<AdditionalGuest[]>([
    { id: '1', name: '' }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!residentData || !serviceId) {
    return null // Sẽ redirect trong useEffect
  }

  const handleAddGuest = () => {
    const newGuest: AdditionalGuest = {
      id: Date.now().toString(),
      name: '',
    }
    setAdditionalGuests([...additionalGuests, newGuest])
  }

  const handleGuestNameChange = (id: string, name: string) => {
    setAdditionalGuests(additionalGuests.map((g) => (g.id === id ? { ...g, name } : g)))
  }

  const handleCheckin = async () => {
    // Lấy danh sách tên người đi cùng (chỉ lấy những người có tên)
    const guestNames = additionalGuests
      .map(g => g.name.trim())
      .filter(name => name !== '')

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const checkInData: ResidentCheckInDto = {
        serviceId: serviceId,
        qrCode: state?.qrCode,
        faceDescriptor: state?.faceDescriptor,
        additionalGuests: guestNames.length > 0 ? guestNames : undefined,
      }

      const result = await residentCheckInOrOut(checkInData)
      setSuccess(result.message || 'Check-in thành công!')
      
      // Reset form sau 2 giây
      setTimeout(() => {
        setAdditionalGuests([{ id: '1', name: '' }])
        navigate('/mainmenu')
      }, 2000)
    } catch (err: any) {
      console.error('Lỗi check-in:', err)
      setError(err.message || 'Có lỗi xảy ra khi check-in. Vui lòng thử lại.')
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
            {/* Căn Hộ */}
            <div className="flex items-center">
              <label className="w-48 text-gray-700 font-medium">Căn Hộ</label>
              <span className="flex-1 text-gray-700">{apartment}</span>
            </div>

            {/* Chủ Hộ */}
            <div className="flex items-center">
              <label className="w-48 text-gray-700 font-medium">Chủ Hộ</label>
              <span className="flex-1 text-gray-700">{ownerName}</span>
            </div>

            {/* Dịch Vụ */}
            <div className="flex items-center">
              <label className="w-48 text-gray-700 font-medium">Dịch Vụ</label>
              <span className="flex-1 text-gray-700 font-semibold">{serviceName}</span>
            </div>

            {/* Phương Thức Checkin */}
            <div className="flex items-center">
              <label className="w-48 text-gray-700 font-medium">Phương Thức Checkin</label>
              <span className="flex-1 text-gray-700">
                {state?.qrCode ? 'QR Code' : state?.faceDescriptor ? 'Face ID' : 'Thẻ'}
              </span>
            </div>

            {/* Thời Gian Vào */}
            <div className="flex items-center">
              <label className="w-48 text-gray-700 font-medium">Thời Gian Vào</label>
              <span className="flex-1 text-gray-700">
                {checkInTime ? new Date(checkInTime).toLocaleString('vi-VN') : ''}
              </span>
            </div>

            {/* Thông tin cư dân chính */}
            <div className="flex items-start">
              <label className="w-48 text-gray-700 font-medium pt-2">Cư Dân</label>
              <div className="flex-1">
                <div className="border border-gray-300 rounded p-3 bg-gray-50">
                  <p className="text-gray-700 font-medium">{ownerName}</p>
                  {residentData?.phone && (
                    <p className="text-gray-500 text-sm mt-1">SĐT: {residentData.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Người đi cùng (additional guests) */}
            <div className="flex items-start">
              <label className="w-48 text-gray-700 font-medium pt-2">Người Đi Cùng</label>
              <div className="flex-1">
                <div className="max-h-64 overflow-y-auto border border-gray-300 rounded">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">
                          STT
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">
                          Họ Và Tên
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-right font-semibold text-gray-700">
                          Hoạt Động
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {additionalGuests.map((guest, index) => (
                        <tr key={guest.id} className="bg-white">
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">
                            {index + 1}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <input
                              type="text"
                              value={guest.name}
                              onChange={(e) => handleGuestNameChange(guest.id, e.target.value)}
                              placeholder="Nhập tên người đi cùng..."
                              className="w-full px-2 py-1 bg-white border-0 outline-none"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <button
                              onClick={handleAddGuest}
                              className="bg-blue-600 text-white px-3 py-1.5 rounded flex items-center gap-1 hover:bg-blue-700 transition-colors text-sm ml-auto"
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
                              Thêm
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                onClick={() => navigate('/screen-checkin')}
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

export default CheckInApartment

