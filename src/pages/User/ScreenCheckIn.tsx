import { useState, useEffect, type FC } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getServices } from '../../api/services.api'
import { findResident } from '../../api/checkin.api'
import { QRScanner } from '../../components/QRScanner'
import { FaceIDScanner } from '../../components/FaceIDScanner'
import { useLocale } from '../../i18n/LocaleContext'
import { FiSearch } from 'react-icons/fi'

interface Service {
  id: number
  serviceName: string
  status: number
}

type ScanMode = 'qr' | 'face' | null
type Mode = 'checkin' | 'checkout'

export const ScreenCheckIn: FC = () => {
  const { t } = useLocale()
  const navigate = useNavigate()
  const location = useLocation()
  const mode: Mode = location.state?.mode || 'checkin'

  const [allServices, setAllServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [scanMode, setScanMode] = useState<ScanMode>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search + Pagination
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const limit = 12

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await getServices(1, 1000)
        const responseData = res?.data || res
        const data = responseData?.data?.items || responseData?.items || []
        const activeServices = Array.isArray(data)
          ? data.filter((s: any) => s.status === 1 || s.status === '1')
          : []
        setAllServices(activeServices)
      } catch {
        setError(t.screenCheckIn.errorLoadServices)
      }
    }
    loadServices()
  }, [])

  const filteredServices = allServices.filter(service =>
    service.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredServices.length / limit)
  const currentServices = filteredServices.slice((page - 1) * limit, page * limit)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage)
  }

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
        state: { residentData, serviceId: selectedService.id, serviceName: selectedService.serviceName, qrCode }
      })
    } catch (err: any) {
      setError(err.message || t.screenCheckIn.errorResidentNotFound)
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
        state: { residentData, serviceId: selectedService.id, serviceName: selectedService.serviceName, faceDescriptor }
      })
    } catch (err: any) {
      setError(err.message || t.screenCheckIn.errorResidentNotFound)
      setLoading(false)
    }
  }

  const renderPagination = () => {
    const pages = []
    const maxDisplay = 5
    let startPage = Math.max(1, page - Math.floor(maxDisplay / 2))
    let endPage = Math.min(totalPages, startPage + maxDisplay - 1)
    if (endPage - startPage < maxDisplay - 1) startPage = Math.max(1, endPage - maxDisplay + 1)

    if (startPage > 1) {
      pages.push(
        <button key={1} onClick={() => handlePageChange(1)} className={`px-3 py-1 rounded border ${page === 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>1</button>
      )
      pages.push(<span key="start-ellipsis" className="px-2">...</span>)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button key={i} onClick={() => handlePageChange(i)} className={`px-3 py-1 rounded border ${i === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>{i}</button>
      )
    }

    if (endPage < totalPages) {
      pages.push(<span key="end-ellipsis" className="px-2">...</span>)
      pages.push(
        <button key={totalPages} onClick={() => handlePageChange(totalPages)} className={`px-3 py-1 rounded border ${page === totalPages ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>{totalPages}</button>
      )
    }

    return (
      <div className="flex gap-2 justify-center mt-6 items-center">
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="px-3 py-1 rounded border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50">&lt;</button>
        {pages}
        <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="px-3 py-1 rounded border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50">&gt;</button>
      </div>
    )
  }

  if (!selectedService) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => navigate('/mainmenu')} className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4">
            ← {t.screenCheckIn.back}
          </button>
          <h1 className="text-3xl font-bold mb-6">{mode === 'checkout' ? t.screenCheckIn.selectServiceCheckout : t.screenCheckIn.selectServiceCheckin}</h1>

          {/* Search bên trái */}
          <div className="mb-6 flex">
            <div className="relative w-full md:w-1/3">
              <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t.screenCheckIn.searchPlaceholder || 'Tìm dịch vụ...'}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                className="w-full pl-10 pr-4 py-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300"
              />
            </div>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentServices.map(service => (
              <button key={service.id} onClick={() => handleServiceSelect(service)} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg text-left">
                <h3 className="text-xl font-semibold">{service.serviceName}</h3>
                <p className="text-gray-500 text-sm">{t.screenCheckIn.selectService}</p>
              </button>
            ))}
          </div>

          {renderPagination()}
        </div>
      </div>
    )
  }

  if (!scanMode) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setSelectedService(null)} className="mb-4 text-blue-600">← {t.screenCheckIn.back}</button>
          <h1 className="text-3xl font-bold mb-6">
            {mode === 'checkout'
              ? t.screenCheckIn.checkoutTitle.replace('{serviceName}', selectedService.serviceName)
              : t.screenCheckIn.checkinTitle.replace('{serviceName}', selectedService.serviceName)}
          </h1>
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => setScanMode('qr')} disabled={loading} className="bg-blue-600 text-white p-8 rounded-lg">{t.screenCheckIn.qrCode}</button>
            <button onClick={() => setScanMode('face')} disabled={loading} className="bg-green-600 text-white p-8 rounded-lg">{t.screenCheckIn.faceID}</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {scanMode === 'qr' && <QRScanner onScan={handleQRScan} onClose={() => setScanMode(null)} title={t.screenCheckIn.scanQRTitle} />}
      {scanMode === 'face' && <FaceIDScanner onScan={handleFaceIDScan} onClose={() => setScanMode(null)} title={t.screenCheckIn.scanFaceIDTitle} />}
    </>
  )
}

export default ScreenCheckIn
