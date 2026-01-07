import { useState, useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { getServices } from '../../api/services.api'
import { useLocale } from '../../i18n/LocaleContext'

interface Service {
  id: number
  serviceName: string
  status: number
}

export const SelectServiceForGuest: FC = () => {
  const { t } = useLocale()
  const navigate = useNavigate()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Tải danh sách dịch vụ
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true)
       

        const res = await getServices(1, 100)
        const responseData = res?.data || res
        const data = responseData?.data?.items || responseData?.items || []

        const activeServices = Array.isArray(data)
          ? data.filter((s: any) => s.status === 1 || s.status === '1')
          : []

        setServices(activeServices)
      } catch (err: any) {
        console.error('Lỗi khi tải danh sách dịch vụ:', err)
        setError(t.selectServiceForGuest.error)
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [])

  const handleServiceSelect = (service: Service) => {
    // Chuyển sang màn hình CheckInOutside với dịch vụ đã chọn
    navigate('/checkinoutside', {
      state: {
        serviceId: service.id,
        serviceName: service.serviceName,
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/mainmenu')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            ← {t.selectServiceForGuest.back}
          </button>
          <h1 className="text-3xl font-bold text-gray-800">{t.selectServiceForGuest.title}</h1>
          <p className="text-gray-500 mt-2">{t.selectServiceForGuest.description}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t.selectServiceForGuest.loading}</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t.selectServiceForGuest.noServices}</p>
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
                <p className="text-gray-500 text-sm">{t.selectServiceForGuest.selectService}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SelectServiceForGuest

