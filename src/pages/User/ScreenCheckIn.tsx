import { useState, useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { getServices } from '../../api/services.api'
import { findResident, type CheckInResponse} from '../../api/checkin.api'
import { QRScanner } from '../../components/QRScanner'
import { FaceIDScanner } from '../../components/FaceIDScanner'

interface Service {
  id: number
  serviceName: string
  status: number
}

type ScanMode = 'qr' | 'face' | null

export const ScreenCheckIn: FC = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [scanMode, setScanMode] = useState<ScanMode>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [checkInResult, setCheckInResult] = useState<CheckInResponse | null>(null)

  // Tải danh sách dịch vụ
  useEffect(() => {
    const loadServices = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          setError('Chưa đăng nhập. Vui lòng đăng nhập lại.')
          return
        }

        const res = await getServices(1, 100)
        const responseData = res?.data || res
        const data = responseData?.data?.items || responseData?.items || []

        const activeServices = Array.isArray(data)
          ? data.filter((s: any) => s.status === 1 || s.status === '1')
          : []

        setServices(activeServices)
      } catch (err: any) {
        console.error('Lỗi khi tải danh sách dịch vụ:', err)
        setError('Không thể tải danh sách dịch vụ.')
      }
    }

    loadServices()
  }, [])

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setError(null)
    setSuccess(null)
    setCheckInResult(null)
  }

  const handleQRScan = async (qrCode: string) => {
    if (!selectedService) return

    setLoading(true)
    setError(null)
    setSuccess(null)
    setScanMode(null)

    try {
      // Bước 1: Tìm thông tin cư dân từ QR code (chưa check-in)
      const residentData = await findResident({ qrCode: qrCode })
      
      console.log('Thông tin cư dân tìm được:', residentData)
      
      // Chuyển sang màn hình CheckInApartment với dữ liệu
      navigate('/checkinapartment', {
        state: {
          residentData: residentData, // Thông tin cư dân từ find-resident
          serviceId: selectedService.id,
          serviceName: selectedService.serviceName,
          qrCode: qrCode,
          faceDescriptor: undefined,
        }
      })
    } catch (err: any) {
      console.error('Lỗi khi tìm cư dân:', err)
      setError(err.message || 'Không tìm thấy cư dân. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  const handleFaceIDScan = async (faceDescriptor: number[]) => {
    if (!selectedService) return

    setLoading(true)
    setError(null)
    setSuccess(null)
    setScanMode(null)

    try {
      // Bước 1: Tìm thông tin cư dân từ Face ID (chưa check-in)
      const residentData = await findResident({ faceDescriptor: faceDescriptor })
      
      console.log('Thông tin cư dân tìm được:', residentData)
      
      // Chuyển sang màn hình CheckInApartment với dữ liệu
      navigate('/checkinapartment', {
        state: {
          residentData: residentData, // Thông tin cư dân từ find-resident
          serviceId: selectedService.id,
          serviceName: selectedService.serviceName,
          qrCode: undefined,
          faceDescriptor: faceDescriptor,
        }
      })
    } catch (err: any) {
      console.error('Lỗi khi tìm cư dân:', err)
      setError(err.message || 'Không tìm thấy cư dân. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  const handleBack = () => {
    setSelectedService(null)
    setScanMode(null)
    setError(null)
    setSuccess(null)
    setCheckInResult(null)
  }

  // Màn hình chọn dịch vụ
  if (!selectedService) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Chọn Dịch Vụ Check-in</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Không có dịch vụ nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {service.serviceName}
                  </h3>
                  <p className="text-gray-500 text-sm">Nhấn để chọn phương thức check-in</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Màn hình chọn phương thức check-in
  if (selectedService && !scanMode) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Quay lại
          </button>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Check-in: {selectedService.serviceName}
          </h1>
          <p className="text-gray-500 mb-6">Chọn phương thức check-in</p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          {checkInResult && (
            <div className="mb-6 p-4 bg-white rounded-lg shadow">
              <h3 className="font-semibold text-gray-800 mb-2">Thông tin Check-in:</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Thời gian:</strong> {checkInResult.checkInTime}</p>
                {checkInResult.serviceName && (
                  <p><strong>Dịch vụ:</strong> {checkInResult.serviceName}</p>
                )}
                {checkInResult.representative && (
                  <p><strong>Người đại diện:</strong> {checkInResult.representative}</p>
                )}
                {checkInResult.apartment && (
                  <p><strong>Căn hộ:</strong> {checkInResult.apartment}</p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setScanMode('qr')}
              disabled={loading}
              className="bg-blue-600 text-white p-8 rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              <div className="text-4xl mb-2">📷</div>
              <h3 className="text-xl font-semibold mb-2">QR Code</h3>
              <p className="text-sm opacity-90">Quét QR code của cư dân</p>
            </button>

            <button
              onClick={() => setScanMode('face')}
              disabled={loading}
              className="bg-green-600 text-white p-8 rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              <div className="text-4xl mb-2">👤</div>
              <h3 className="text-xl font-semibold mb-2">Face ID</h3>
              <p className="text-sm opacity-90">Quét khuôn mặt cư dân</p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Màn hình quét QR hoặc Face ID
  return (
    <>
      {scanMode === 'qr' && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setScanMode(null)}
          title={`Quét QR Code - ${selectedService.serviceName}`}
        />
      )}

      {scanMode === 'face' && (
        <FaceIDScanner
          onScan={handleFaceIDScan}
          onClose={() => setScanMode(null)}
          title={`Quét Face ID - ${selectedService.serviceName}`}
        />
      )}
    </>
  )
}

export default ScreenCheckIn

