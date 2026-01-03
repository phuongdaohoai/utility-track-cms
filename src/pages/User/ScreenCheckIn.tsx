import { useState, useEffect, type FC } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getServices } from '../../api/services.api'
import { findResident } from '../../api/checkin.api'
import { QRScanner } from '../../components/QRScanner'
import { FaceIDScanner } from '../../components/FaceIDScanner'

interface Service {
  id: number
  serviceName: string
  status: number
}

type ScanMode = 'qr' | 'face' | null
type Mode = 'checkin' | 'checkout'

export const ScreenCheckIn: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const mode: Mode = location.state?.mode || 'checkin'

  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [scanMode, setScanMode] = useState<ScanMode>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await getServices(1, 100)
        const responseData = res?.data || res
        const data = responseData?.data?.items || responseData?.items || []
        const activeServices = Array.isArray(data)
          ? data.filter((s: any) => s.status === 1 || s.status === '1')
          : []
        setServices(activeServices)
      } catch {
        setError('Không thể tải danh sách dịch vụ.')
      }
    }

    loadServices()
  }, [])

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setScanMode(null)
    setError(null)
  }

  const handleQRScan = async (qrCode: string) => {
    if (!selectedService) return
    setLoading(true)
    setScanMode(null)

    try {
      const residentData = await findResident({ qrCode })

      if (mode === 'checkout') {
        navigate('/mainmenu')
        return
      }

      navigate('/checkinapartment', {
        state: {
          residentData,
          serviceId: selectedService.id,
          serviceName: selectedService.serviceName,
          qrCode,
        },
      })
    } catch (err: any) {
      setError(err.message || 'Không tìm thấy cư dân.')
      setLoading(false)
    }
  }

  const handleFaceIDScan = async (faceDescriptor: number[]) => {
    if (!selectedService) return
    setLoading(true)
    setScanMode(null)

    try {
      const residentData = await findResident({ faceDescriptor })

      if (mode === 'checkout') {
        navigate('/mainmenu')
        return
      }

      navigate('/checkinapartment', {
        state: {
          residentData,
          serviceId: selectedService.id,
          serviceName: selectedService.serviceName,
          faceDescriptor,
        },
      })
    } catch (err: any) {
      setError(err.message || 'Không tìm thấy cư dân.')
      setLoading(false)
    }
  }

  if (!selectedService) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">
            {mode === 'checkout' ? 'Chọn Dịch Vụ Check-out' : 'Chọn Dịch Vụ Check-in'}
          </h1>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(service => (
              <button
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg text-left"
              >
                <h3 className="text-xl font-semibold">{service.serviceName}</h3>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!scanMode) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedService(null)}
            className="mb-4 text-blue-600"
          >
            ← Quay lại
          </button>

          <h1 className="text-3xl font-bold mb-6">
            {mode === 'checkout'
              ? `Check-out: ${selectedService.serviceName}`
              : `Check-in: ${selectedService.serviceName}`}
          </h1>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setScanMode('qr')}
              disabled={loading}
              className="bg-blue-600 text-white p-8 rounded-lg"
            >
              QR Code
            </button>

            <button
              onClick={() => setScanMode('face')}
              disabled={loading}
              className="bg-green-600 text-white p-8 rounded-lg"
            >
              Face ID
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {scanMode === 'qr' && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setScanMode(null)}
          title="Quét QR Code"
        />
      )}

      {scanMode === 'face' && (
        <FaceIDScanner
          onScan={handleFaceIDScan}
          onClose={() => setScanMode(null)}
          title="Quét Face ID"
        />
      )}
    </>
  )
}

export default ScreenCheckIn
