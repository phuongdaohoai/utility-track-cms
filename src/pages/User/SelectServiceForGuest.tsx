import { useState, useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { getServices } from '../../api/services.api'
import { useLocale } from '../../i18n/LocaleContext'
import { FiSearch } from 'react-icons/fi'

interface Service {
  id: number
  serviceName: string
  status: number
}

export const SelectServiceForGuest: FC = () => {
  const { t } = useLocale()
  const navigate = useNavigate()
  const [allServices, setAllServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const limit = 12

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true)
        const res = await getServices(1, 1000)
        const responseData = res?.data || res
        const data = responseData?.data?.items || responseData?.items || []

        const activeServices = Array.isArray(data)
          ? data.filter((s: any) => s.status === 1 || s.status === '1')
          : []

        setAllServices(activeServices)
      } catch (err: any) {
        console.error('Lỗi khi tải danh sách dịch vụ:', err)
        setError(t.selectServiceForGuest.error)
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [])

  const filteredServices = allServices.filter((service) =>
    service.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredServices.length / limit)
  const currentServices = filteredServices.slice((page - 1) * limit, page * limit)

  const handleServiceSelect = (service: Service) => {
    navigate('/checkinoutside', {
      state: { serviceId: service.id, serviceName: service.serviceName }
    })
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const renderPagination = () => {
    const pages = []
    const maxDisplay = 5
    let startPage = Math.max(1, page - Math.floor(maxDisplay / 2))
    let endPage = Math.min(totalPages, startPage + maxDisplay - 1)
    if (endPage - startPage < maxDisplay - 1) {
      startPage = Math.max(1, endPage - maxDisplay + 1)
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-3 py-1 rounded border ${page === 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          1
        </button>
      )
      pages.push(<span key="start-ellipsis" className="px-2">...</span>)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded border ${i === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          {i}
        </button>
      )
    }

    if (endPage < totalPages) {
      pages.push(<span key="end-ellipsis" className="px-2">...</span>)
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-3 py-1 rounded border ${page === totalPages ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          {totalPages}
        </button>
      )
    }

    return (
      <div className="flex gap-2 justify-center mt-6 items-center">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 rounded border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          &lt;
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 rounded border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          &gt;
        </button>
      </div>
    )
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

        {/* Search bên trái */}
        <div className="mb-6 flex">
          <div className="relative w-full md:w-1/3">
            <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t.selectServiceForGuest.searchPlaceholder || 'Tìm dịch vụ...'}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300"
            />
          </div>
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
        ) : currentServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t.selectServiceForGuest.noServices}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentServices.map((service) => (
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
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  )
}

export default SelectServiceForGuest
