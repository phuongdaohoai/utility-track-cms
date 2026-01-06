import { useState, useEffect, type FC } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { residentCheckInOrOut, type ResidentCheckInDto } from '../../api/checkin.api'
import { useLocale } from '../../i18n/LocaleContext'

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
  residentData: ResidentData
  serviceId: number
  serviceName: string
  qrCode?: string
  faceDescriptor?: number[]
}

export const CheckInApartment: FC = () => {
  const { t, locale } = useLocale()
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null

  useEffect(() => {
    if (!state?.residentData) {
      navigate('/screen-checkin')
    }
  }, [state, navigate])

  const residentData = state?.residentData
  const serviceId = state?.serviceId
  const serviceName = state?.serviceName || ''

  const apartment =
    typeof residentData?.apartment === 'string'
      ? residentData.apartment
      : residentData?.apartment?.roomNumber
      ? `${residentData.apartment.building || ''}${residentData.apartment.roomNumber || ''}`.trim()
      : ''

  const ownerName = residentData?.fullName || ''

  const now = new Date()
  const checkInTime = now.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')

  const [additionalGuests, setAdditionalGuests] = useState<AdditionalGuest[]>([
    { id: '1', name: '' },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!residentData || !serviceId) return null

  const handleAddGuest = () => {
    setAdditionalGuests([...additionalGuests, { id: Date.now().toString(), name: '' }])
  }

  const handleGuestNameChange = (id: string, name: string) => {
    setAdditionalGuests(additionalGuests.map((g) => (g.id === id ? { ...g, name } : g)))
  }

  const handleCheckin = async () => {
    const guestNames = additionalGuests.map(g => g.name.trim()).filter(Boolean)

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const checkInData: ResidentCheckInDto = {
        serviceId,
        qrCode: state?.qrCode,
        faceDescriptor: state?.faceDescriptor,
        additionalGuests: guestNames.length ? guestNames : undefined,
      }

      const result = await residentCheckInOrOut(checkInData)
      setSuccess(result.message || t.checkInApartment.checkinSuccess)

      setTimeout(() => {
        setAdditionalGuests([{ id: '1', name: '' }])
        navigate('/mainmenu')
      }, 2000)
    } catch (err: any) {
      setError(err.message || t.checkInApartment.checkinFailed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <div className="border border-gray-300 bg-white p-6 rounded-lg">
          <div className="space-y-4">
            {/* Căn Hộ */}
            <div className="flex items-center">
              <label className="w-48 font-medium">
                {t.checkInApartment.apartment}
              </label>
              <span className="flex-1">{apartment}</span>
            </div>

            {/* Chủ Hộ */}
            <div className="flex items-center">
              <label className="w-48 font-medium">
                {t.checkInApartment.owner}
              </label>
              <span className="flex-1">{ownerName}</span>
            </div>

            {/* Dịch Vụ */}
            <div className="flex items-center">
              <label className="w-48 font-medium">
                {t.checkInApartment.service}
              </label>
              <span className="flex-1 font-semibold">{serviceName}</span>
            </div>

            {/* Phương Thức */}
            <div className="flex items-center">
              <label className="w-48 font-medium">
                {t.checkInApartment.checkinMethod}
              </label>
              <span className="flex-1">
                {state?.qrCode
                  ? t.checkInApartment.method.qr
                  : state?.faceDescriptor
                  ? t.checkInApartment.method.faceId
                  : t.checkInApartment.method.card}
              </span>
            </div>

            {/* Thời Gian */}
            <div className="flex items-center">
              <label className="w-48 font-medium">
                {t.checkInApartment.checkinTime}
              </label>
              <span className="flex-1">{checkInTime}</span>
            </div>

            {/* Cư Dân */}
            <div className="flex items-start">
              <label className="w-48 font-medium pt-2">
                {t.checkInApartment.resident}
              </label>
              <div className="flex-1 border rounded p-3 bg-gray-50">
                <p className="font-medium">{ownerName}</p>
                {residentData?.phone && (
                  <p className="text-sm text-gray-500">
                    {t.users.phone}: {residentData.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Người Đi Cùng */}
            <div className="flex items-start">
              <label className="w-48 font-medium pt-2">
                {t.checkInApartment.additionalGuests}
              </label>
              <div className="flex-1 border rounded max-h-64 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2">STT</th>
                      <th className="border p-2">
                        {t.checkInApartment.guestName}
                      </th>
                      <th className="border p-2 text-right">
                        {t.common.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {additionalGuests.map((guest, i) => (
                      <tr key={guest.id}>
                        <td className="border p-2">{i + 1}</td>
                        <td className="border p-2">
                          <input
                            value={guest.name}
                            onChange={(e) =>
                              handleGuestNameChange(guest.id, e.target.value)
                            }
                            placeholder={t.checkInApartment.enterGuestName}
                            className="w-full outline-none"
                          />
                        </td>
                        <td className="border p-2 text-right">
                          <button
                            onClick={handleAddGuest}
                            className="bg-blue-600 text-white px-3 py-1 rounded"
                          >
                            {t.checkInApartment.add}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Message */}
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 text-green-700 p-3 rounded">
                {success}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => navigate('/screen-checkin')}
                className="bg-gray-500 text-white px-8 py-3 rounded-lg"
              >
                {t.common.back}
              </button>
              <button
                onClick={handleCheckin}
                disabled={loading}
                className="bg-blue-800 text-white px-16 py-3 rounded-lg disabled:bg-gray-400"
              >
                {loading
                  ? t.checkInApartment.processing
                  : t.checkInApartment.checkin}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckInApartment
