import { useState, useEffect, type FC } from 'react'

interface Resident {
  id: string
  name: string
  selected: boolean
  isExtra: boolean // true nếu là người thêm vào, false nếu là cư dân có sẵn
}

export const CheckInApartment: FC = () => {
  const [apartment] = useState<string>('A22.01')
  const [ownerName] = useState<string>('Nguyễn A')
  const [service, setService] = useState<string>()
  const [residents, setResidents] = useState<Resident[]>([
    { id: '1', name: 'Nguyễn A', selected: false, isExtra: false },
    { id: '2', name: '', selected: false, isExtra: true },
  ])
  const [checkinTime, setCheckinTime] = useState<string>('')

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

  const handleAddPerson = () => {
    const newPerson: Resident = {
      id: Date.now().toString(),
      name: '',
      selected: false,
      isExtra: true,
    }
    setResidents([...residents, newPerson])
  }

  const handlePersonNameChange = (id: string, name: string) => {
    setResidents(residents.map((r) => (r.id === id ? { ...r, name } : r)))
  }

  const handleToggleSelect = (id: string) => {
    setResidents(
      residents.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    )
  }

  const handleCheckin = () => {
    const selectedResidents = residents.filter((r) => r.selected)
    // TODO: Xử lý logic checkin
    console.log('Checkin:', {
      apartment,
      ownerName,
      service,
      selectedResidents,
      checkinTime,
    })
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
              <input
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="Bơi (Hồ A)"
                className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded"
              />
            </div>

            {/* Phương Thức Checkin */}
            <div className="flex items-center">
              <label className="w-48 text-gray-700 font-medium">Phương Thức Checkin</label>
              <span className="flex-1 text-gray-700">Thẻ</span>
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
                          Chọn
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {residents.map((resident, index) => (
                        <tr key={resident.id} className="bg-white">
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">
                            {index + 1}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="flex items-center">
                              <input
                                type="text"
                                value={resident.name}
                                onChange={(e) =>
                                  handlePersonNameChange(resident.id, e.target.value)
                                }
                                placeholder="Nhập Tên..."
                                readOnly={!resident.isExtra}
                                className="w-full bg-transparent border-0 outline-none focus:ring-0 text-gray-700"
                              />
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="flex items-center justify-end">
                              {resident.isExtra ? (
                                <button
                                  onClick={handleAddPerson}
                                  className="bg-blue-600 text-white px-3 py-1.5 rounded flex items-center gap-1 hover:bg-blue-700 transition-colors text-sm"
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
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={resident.selected}
                                  onChange={() => handleToggleSelect(resident.id)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Nút Checkin */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleCheckin}
                className="bg-blue-800 text-white px-16 py-3 rounded-lg font-semibold text-lg hover:bg-blue-900 transition-colors"
              >
                Checkin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckInApartment

