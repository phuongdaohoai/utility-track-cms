import { api } from '../utils/api'

/**
 * DTO cho Check-in cư dân ngoài (Guest)
 */
export interface CreateCheckInDto {
  guestName?: string
  guestPhone: string
  serviceId: number
}

/**
 * DTO cho Check-in cư dân CC (Resident)
 */
export interface ResidentCheckInDto {
  qrCode?: string
  faceDescriptor?: number[]
  serviceId: number
  additionalGuests?: string[]
}

/**
 * Response từ API Check-in
 */
export interface CheckInResponse {
  checkinId?: number
  status: 'CHECK_IN' | 'CHECK_OUT'
  message: string
  checkInTime: string
  checkOutTime?: string | null
  serviceName?: string
  representative?: string
  phoneNumber?: string
  quantity?: number
  members?: Array<{ stt: number; fullName: string }>
  type?: 'GUEST' | 'RESIDENT'
  apartment?: string | null
}

/**
 * Check-in cho cư dân ngoài (Guest)
 * Endpoint: POST /checkin hoặc /check-in/create
 * TODO: Cần xác nhận endpoint chính xác từ BE
 */
export const createGuestCheckIn = async (data: CreateCheckInDto): Promise<CheckInResponse> => {
  const response = await api.post('/checkin', data)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Lỗi khi check-in')
  }
  
  const result = await response.json()
  return result.data || result
}

/**
 * Check-in/Check-out cho cư dân CC (Resident)
 * Endpoint: POST /checkin/resident hoặc /check-in/resident
 * TODO: Cần xác nhận endpoint chính xác từ BE
 */
export const residentCheckInOrOut = async (data: ResidentCheckInDto): Promise<CheckInResponse> => {
  const response = await api.post('/checkin/resident', data)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Lỗi khi check-in/check-out')
  }
  
  const result = await response.json()
  return result.data || result
}

/**
 * Lấy danh sách check-in hiện tại
 * Endpoint: GET /checkin/current
 * TODO: Cần xác nhận endpoint chính xác từ BE
 */
export const getCurrentCheckIns = async (params?: {
  page?: number
  pageSize?: number
  search?: string
}) => {
  const queryParams = new URLSearchParams()
  
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
  if (params?.search) queryParams.append('search', params.search)
  
  const response = await api.get(`/checkin/current?${queryParams.toString()}`)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Lỗi khi lấy danh sách check-in')
  }
  
  const result = await response.json()
  return result.data || result
}

/**
 * Check-out theo checkinId
 * Endpoint: POST /checkin/checkout/:id hoặc PUT /checkin/:id/checkout
 * TODO: Cần xác nhận endpoint chính xác từ BE
 */
export const checkoutById = async (checkinId: number) => {
  const response = await api.post(`/checkin/checkout/${checkinId}`, {})
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Lỗi khi check-out')
  }
  
  const result = await response.json()
  return result.data || result
}

