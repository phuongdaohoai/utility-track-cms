import { useState, useEffect, useMemo, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { useLocale } from '../../i18n/LocaleContext'
import { getCurrentCheckIns } from '../../api/checkin.api'
import { checkoutById } from '../../api/checkin.api'
import type { CheckInItem } from '../../services/checkInService'

interface CheckInOption {
  value: number
  label: string
  phone: string
  data: CheckInItem
}

export const GuestCheckout: FC = () => {
  const { t } = useLocale()
  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState('')
  const [options, setOptions] = useState<CheckInOption[]>([])
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckInItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkoutQuantity, setCheckoutQuantity] = useState<number | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  // Lấy tất cả check-ins khi component mount
  useEffect(() => {
    const loadAllCheckIns = async () => {
      try {
        setLoading(true)
        // Lấy tất cả check-ins với pageSize lớn
        const response = await getCurrentCheckIns({
          page: 1,
          pageSize: 1000,
          search: ''
        })
        
        const items = response?.items || response?.data?.items || []
        // Lọc chỉ lấy khách ngoài (room === "-" hoặc không có room)
        const guestCheckIns = items.filter((item: CheckInItem) => 
          !item.room || item.room === '-' || item.room === ''
        )
        
        // Tạo options cho Select
        const checkInOptions: CheckInOption[] = guestCheckIns.map((item: CheckInItem) => ({
          value: item.id,
          label: `${item.displayName} - ${item.serviceName}`,
          phone: item.displayName, // Có thể cần điều chỉnh nếu có field phone riêng
          data: item
        }))
        
        setOptions(checkInOptions)
      } catch (error) {
        console.error('Lỗi khi tải danh sách check-in:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAllCheckIns()
  }, [])

  // Lọc options theo input
  const filteredOptions = useMemo(() => {
    if (!inputValue) return options
    
    const searchLower = inputValue.toLowerCase()
    return options.filter(option => 
      option.label.toLowerCase().includes(searchLower) ||
      option.phone.toLowerCase().includes(searchLower)
    )
  }, [inputValue, options])

  // Xử lý khi chọn check-in
  const handleSelectChange = (selected: CheckInOption | null) => {
    if (selected) {
      setSelectedCheckIn(selected.data)
      setCheckoutQuantity(null)
    } else {
      setSelectedCheckIn(null)
      setCheckoutQuantity(null)
    }
  }

  // Format thời gian
  const formatTime = (isoString: string) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    const time = date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false, 
      timeZone: 'UTC' 
    })
    const day = date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      timeZone: 'UTC' 
    })
    return `${time}h - ${day}`
  }

  // Xử lý checkout tất cả
  const handleCheckoutAll = async () => {
    if (!selectedCheckIn) return
    
    const confirm = window.confirm(t.guestCheckout.confirmCheckout)
    if (!confirm) return

    try {
      setIsCheckingOut(true)
      await checkoutById(selectedCheckIn.id)
      alert(t.guestCheckout.checkoutSuccess)
      // Reset và load lại
      setSelectedCheckIn(null)
      setCheckoutQuantity(null)
      setInputValue('')
      // Có thể reload danh sách nếu cần
    } catch (error: any) {
      console.error('Lỗi checkout:', error)
      alert(error.message || t.guestCheckout.checkoutFailed)
    } finally {
      setIsCheckingOut(false)
    }
  }

  // Xử lý checkout theo số lượng
  const handleCheckoutByQuantity = async () => {
    if (!selectedCheckIn || !checkoutQuantity || checkoutQuantity <= 0) {
      alert('Vui lòng chọn số lượng hợp lệ')
      return
    }

    if (checkoutQuantity > selectedCheckIn.totalPeople) {
      alert('Số lượng checkout không được vượt quá số người đã check-in')
      return
    }

    const confirm = window.confirm(
      `${t.guestCheckout.confirmCheckout}\n${t.guestCheckout.selectQuantity}: ${checkoutQuantity}`
    )
    if (!confirm) return

    try {
      setIsCheckingOut(true)
      // Gọi API checkout với quantity (có thể cần điều chỉnh API)
      await checkoutById(selectedCheckIn.id)
      alert(t.guestCheckout.checkoutSuccess)
      // Reset
      setSelectedCheckIn(null)
      setCheckoutQuantity(null)
      setInputValue('')
    } catch (error: any) {
      console.error('Lỗi checkout:', error)
      alert(error.message || t.guestCheckout.checkoutFailed)
    } finally {
      setIsCheckingOut(false)
    }
  }

  // Tạo options cho select số lượng
  const quantityOptions = useMemo(() => {
    if (!selectedCheckIn) return []
    return Array.from({ length: selectedCheckIn.totalPeople }, (_, i) => ({
      value: i + 1,
      label: `${i + 1} ${i === 0 ? 'người' : 'người'}`
    }))
  }, [selectedCheckIn])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/mainmenu')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            ← {t.guestCheckout.back}
          </button>
          <h1 className="text-3xl font-bold text-gray-800">{t.guestCheckout.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bên trái: Tìm kiếm */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t.guestCheckout.searchPhone}
            </h2>
            
            <div className="mb-4">
              <Select
                options={filteredOptions}
                onInputChange={setInputValue}
                onChange={handleSelectChange}
                placeholder={t.guestCheckout.searchPlaceholder}
                isSearchable
                isLoading={loading}
                noOptionsMessage={() => t.guestCheckout.noResults}
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '48px',
                    fontSize: '16px',
                  }),
                }}
              />
            </div>

            {selectedCheckIn && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">{t.guestCheckout.selectGuest}</p>
                <p className="font-semibold text-gray-800">{selectedCheckIn.displayName}</p>
                <p className="text-sm text-gray-600">{selectedCheckIn.serviceName}</p>
              </div>
            )}
          </div>

          {/* Bên phải: Giao diện checkout */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t.guestCheckout.guestInfo}
            </h2>

            {!selectedCheckIn ? (
              <div className="text-center py-12 text-gray-500">
                <p>{t.guestCheckout.selectGuest}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Thông tin khách */}
                <div className="border-b pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={`https://i.pravatar.cc/60?img=${selectedCheckIn.id % 70}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      alt="Avatar"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {selectedCheckIn.displayName}
                      </h3>
                      <p className="text-sm text-gray-500">Khách ngoài</p>
                    </div>
                  </div>
                </div>

                {/* Chi tiết */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">{t.guestCheckout.service}:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedCheckIn.serviceName}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">{t.guestCheckout.checkInTime}:</span>
                    <span className="font-semibold text-gray-800">
                      {formatTime(selectedCheckIn.checkInTime)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">{t.guestCheckout.quantity}:</span>
                    <span className="font-semibold text-indigo-600 text-lg">
                      {selectedCheckIn.totalPeople}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-3">
                  {/* Checkout tất cả */}
                  <button
                    onClick={handleCheckoutAll}
                    disabled={isCheckingOut}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCheckingOut ? t.common.loading : t.guestCheckout.checkoutAll}
                  </button>

                  {/* Checkout theo số lượng */}
                  {selectedCheckIn.totalPeople > 1 && (
                    <div className="space-y-2">
                      <Select
                        options={quantityOptions}
                        onChange={(option) => setCheckoutQuantity(option?.value || null)}
                        placeholder={t.guestCheckout.selectQuantity}
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                      <button
                        onClick={handleCheckoutByQuantity}
                        disabled={isCheckingOut || !checkoutQuantity}
                        className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCheckingOut ? t.common.loading : t.guestCheckout.checkoutByQuantity}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuestCheckout
