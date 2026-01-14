import { useState, useEffect, useMemo, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { useLocale } from '../../i18n/LocaleContext'
import { getAllCheckIns, partialCheckout } from '../../api/checkin.api'
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
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  
  // ✅ Đã đổi từ selectedPeople sang selectedIndices để lưu vị trí (index)
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])

  // ✅ Tạo danh sách khách (guestList) ngay đầu để các hàm bên dưới có thể sử dụng
  const guestList = useMemo(() => {
    if (!selectedCheckIn) return []
    return [
      {
        name: selectedCheckIn.displayName,
        isRepresentative: true,
      },
      ...(Array.isArray(selectedCheckIn.additionalGuests)
        ? selectedCheckIn.additionalGuests.map((name) => ({
            name,
            isRepresentative: false,
          }))
        : []),
    ]
  }, [selectedCheckIn])

  // Hàm tải tất cả check-ins
  const loadAllCheckIns = async (): Promise<CheckInOption[]> => {
    try {
      setLoading(true)
      const items = await getAllCheckIns()

      const guestCheckIns = items.filter((item: any) =>
        !item.room || item.room === '-' || item.room === ''
      )

      const checkInOptions: CheckInOption[] = guestCheckIns.map((item: any) => ({
        value: item.id,
        label: `${item.displayName} - ${item.serviceName}`,
        phone: item.phone || '',
        data: item
      }))

      setOptions(checkInOptions)
      return checkInOptions
    } catch (error) {
      console.error('Lỗi khi tải danh sách check-in:', error)
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllCheckIns()
  }, [])

  const filteredOptions = useMemo(() => {
    if (!inputValue) return options
    const searchLower = inputValue.toLowerCase().trim()
    return options.filter(option =>
      option.label.toLowerCase().includes(searchLower) ||
      (option.phone || '').toLowerCase().includes(searchLower)
    )
  }, [inputValue, options])

  const handleSelectChange = (selected: CheckInOption | null) => {
    if (selected) {
      setSelectedCheckIn(selected.data)
      setSelectedIndices([]) // ✅ Reset mảng index
    } else {
      setSelectedCheckIn(null)
      setSelectedIndices([]) // ✅ Reset mảng index
    }
  }

  // ✅ Hàm toggle nhận vào Index thay vì Name
  const handleTogglePerson = (index: number) => {
    setSelectedIndices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index)
      } else {
        return [...prev, index]
      }
    })
  }

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

  const handleCheckoutAll = async () => {
    if (!selectedCheckIn) return

    const confirm = window.confirm(t.guestCheckout.confirmCheckout)
    if (!confirm) return

    try {
      setIsCheckingOut(true)
      await checkoutById(selectedCheckIn.id)
      alert(t.guestCheckout.checkoutSuccess)
      await loadAllCheckIns()
      setSelectedCheckIn(null)
      setSelectedIndices([]) // ✅ Sửa selectedPeople thành selectedIndices
    } catch (error: any) {
      console.error('Lỗi checkout:', error)
      alert(error.message || t.guestCheckout.checkoutFailed)
    } finally {
      setIsCheckingOut(false)
    }
  }

  const handleCheckoutByQuantity = async () => {
    // ✅ Sửa selectedPeople.length thành selectedIndices.length
    if (!selectedCheckIn || selectedIndices.length === 0) {
      alert('Vui lòng chọn ít nhất một người để checkout')
      return
    }

    const confirm = window.confirm(
      `${t.guestCheckout.confirmCheckout}\n${t.guestCheckout.selectQuantity}: ${selectedIndices.length} người` // ✅ Sửa length
    )
    if (!confirm) return

    try {
      setIsCheckingOut(true)

      // ✅ Map từ Index sang Name trước khi gửi API
      const guestsToCheckout = selectedIndices;
         

      await partialCheckout(selectedCheckIn.id, guestsToCheckout)

      alert(t.guestCheckout.checkoutSuccess)
      const newOptions = await loadAllCheckIns()
      const updated = newOptions.find(o => o.value === selectedCheckIn.id)
      if (updated) {
        setSelectedCheckIn(updated.data)
      } else {
        setSelectedCheckIn(null)
        setInputValue('')
      }
      setSelectedIndices([]) // ✅ Reset index
    } catch (error: any) {
      console.error('Lỗi checkout:', error)
      alert(error.message || t.guestCheckout.checkoutFailed)
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
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
                value={selectedCheckIn ? options.find(o => o.value === selectedCheckIn.id) ?? null : null}
                filterOption={() => true}
                onInputChange={(value, actionMeta) => {
                  if (actionMeta.action === 'input-change') {
                    setInputValue(value)
                  }
                }}
                onChange={handleSelectChange}
                placeholder={t.guestCheckout.searchPlaceholder}
                isSearchable
                isLoading={loading}
                noOptionsMessage={() => t.guestCheckout.noResults}
                className="react-select-container"
                classNamePrefix="react-select"
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
            {!selectedCheckIn ? (
              <div className="text-center py-12 text-gray-500">
                <p>{t.guestCheckout.selectGuest}</p>
              </div>
            ) : (
              <div className="border border-gray-300 bg-white p-6 rounded-lg">
                <div className="space-y-4">
                  {/* Đại Diện */}
                  <div className="flex items-center">
                    <label className="w-48 text-gray-700 font-medium">
                      {t.checkInOutside.representative}
                    </label>
                    <span className="flex-1 text-gray-700 font-semibold">
                      {selectedCheckIn.displayName}
                    </span>
                  </div>

                  {/* Số Điện Thoại */}
                  <div className="flex items-center">
                    <label className="w-48 text-gray-700 font-medium">
                      {t.checkInOutside.phone}
                    </label>
                    <span className="flex-1 text-gray-700 font-semibold">
                      {selectedCheckIn.phone}
                    </span>
                  </div>

                  {/* Dịch Vụ */}
                  <div className="flex items-center">
                    <label className="w-48 text-gray-700 font-medium">
                      {t.checkInOutside.service}
                    </label>
                    <span className="flex-1 text-gray-700 font-semibold">
                      {selectedCheckIn.serviceName}
                    </span>
                  </div>

                  {/* Phương Thức Checkin */}
                  <div className="flex items-center">
                    <label className="w-48 text-gray-700 font-medium">
                      {t.checkInOutside.checkinMethod}
                    </label>
                    <span className="flex-1 text-gray-700">
                      {selectedCheckIn.method || t.checkInOutside.manual}
                    </span>
                  </div>

                  {/* Thời Gian Vào */}
                  <div className="flex items-center">
                    <label className="w-48 text-gray-700 font-medium">
                      {t.checkInOutside.checkinTime}
                    </label>
                    <span className="flex-1 text-gray-700">{formatTime(selectedCheckIn.checkInTime)}</span>
                  </div>

                  {/* Số Lượng */}
                  <div className="flex items-start">
                    <label className="w-48 text-gray-700 font-medium pt-2">
                      {t.checkInOutside.quantity}
                    </label>
                    <div className="flex-1">
                      {/* Bảng */}
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
                          {guestList.map((guest, rowIndex) => (
                            <tr key={rowIndex} className="bg-white">
                              <td className="border border-gray-300 px-4 py-2 text-gray-700">
                                {rowIndex + 1}
                              </td>

                              <td className="border border-gray-300 px-4 py-2 text-gray-700">
                                {guest.name}
                              
                              </td>

                              <td className="border border-gray-300 px-4 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedIndices.includes(rowIndex)} // ✅ Kiểm tra theo vị trí
                                  onChange={() => handleTogglePerson(rowIndex)}
                                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Thông báo - ✅ Sửa selectedPeople thành selectedIndices */}
                  {selectedIndices.length > 0 && selectedCheckIn.totalPeople > 1 &&  (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded">
                      Đã chọn {selectedIndices.length} người để checkout
                    </div>
                  )}

                  {/* Nút Checkout */}
                  <div className="flex justify-center gap-4 mt-6">
                    <button
                      onClick={() => {
                        setSelectedCheckIn(null)
                        setSelectedIndices([]) // ✅ Reset
                        setInputValue('')
                      }}
                      className="bg-gray-500 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-600 transition-colors"
                    >
                      {t.common.cancel}
                    </button>
                    <button
                      onClick={handleCheckoutAll}
                      disabled={isCheckingOut}
                      className="bg-blue-800 text-white px-16 py-3 rounded-lg font-semibold text-lg hover:bg-blue-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isCheckingOut ? t.common.loading : t.guestCheckout.checkoutAll}
                    </button>
                  </div>

                  {/* Checkout theo số lượng đã chọn - ✅ Sửa biến và điều kiện */}
                  {selectedCheckIn.totalPeople > 1 && selectedIndices.length > 0 && (
                    <div className="flex justify-center">
                      <button
                        onClick={handleCheckoutByQuantity}
                        disabled={isCheckingOut || selectedIndices.length === 0}
                        className="bg-yellow-500 text-black px-16 py-3 rounded-lg font-semibold text-lg hover:bg-yellow-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isCheckingOut ? t.common.loading : `Checkout ${selectedIndices.length} người`}
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