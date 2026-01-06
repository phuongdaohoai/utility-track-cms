import { api } from '../utils/api'
import { API_BASE_URL } from '../utils/url'

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
 * Endpoint: POST /check-in/guests
 */
export const createGuestCheckIn = async (data: CreateCheckInDto): Promise<CheckInResponse> => {
  const endpoint = '/check-in/guests'
  const fullUrl = `${API_BASE_URL}${endpoint}`
  
  console.log('🔍 [DEBUG] Check-in Guest Request:', {
    endpoint,
    fullUrl,
    baseUrl: API_BASE_URL,
    data,
    token: localStorage.getItem('accessToken') ? 'Có token' : 'Không có token',
  })
  
  const response = await api.post(endpoint, data)
  
  console.log('📡 [DEBUG] Response Status:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    url: response.url,
  })
  
  if (!response.ok) {
    let errorMessage = 'Lỗi khi check-in'
    let errorData: any = null
    
    try {
      errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
      console.error('❌ [DEBUG] Error Response:', errorData)
    } catch {
      // Nếu không parse được JSON, dùng status text
      console.error('❌ [DEBUG] Cannot parse error response as JSON')
      if (response.status === 404) {
        errorMessage = `Endpoint không tồn tại: ${fullUrl}. Vui lòng kiểm tra lại cấu hình API.`
      } else if (response.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
      } else if (response.status === 403) {
        errorMessage = 'Bạn không có quyền thực hiện check-in.'
      } else {
        errorMessage = `Lỗi server (${response.status}): ${response.statusText}`
      }
    }
    
    throw new Error(errorMessage)
  }
  
  const result = await response.json()
  console.log('✅ [DEBUG] Success Response:', result)
  return result.data || result
}

/**
 * Check-in/Check-out cho cư dân CC (Resident)
 * Endpoint: POST /check-in/resident-check-in
 */
export const residentCheckInOrOut = async (data: ResidentCheckInDto): Promise<CheckInResponse> => {
  const response = await api.post('/check-in/resident-check-in', data)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Lỗi khi check-in/check-out')
  }
  
  const result = await response.json()
  return result.data || result
}

/**
 * Lấy danh sách check-in hiện tại
 * Endpoint: GET /check-in/current-check-ins
 */
export const getCurrentCheckIns = async (params?: {
  page?: number
  pageSize?: number
  search?: string
}) => {
  const response = await api.get('/check-in/current-check-ins', {
    params: {
      page: params?.page,
      pageSize: params?.pageSize,
      search: params?.search,
    }
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Lỗi khi lấy danh sách check-in')
  }
  
  const result = await response.json()
  return result.data || result
}

/**
 * Lấy tất cả check-in (không phân trang)
 * Endpoint: GET /check-in/get-all-check-ins
 */
export const getAllCheckIns = async () => {
  const response = await api.get('/check-in/get-all-check-ins')

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Lỗi khi lấy danh sách check-in')
  }

  const result = await response.json()
  // API trả về { success: true, message: "Success", data: [...] }
  return result.data || []
}

/**
 * Check-out theo checkinId (Checkout All)
 * Endpoint: POST /check-in/current-check-outs/{checkinId}
 */
export const checkoutById = async (checkinId: number) => {
  const response = await api.post(`/check-in/current-check-outs/${checkinId}`, {
    checkinId: checkinId
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Lỗi khi check-out')
  }
  
  const result = await response.json()
  return result.data || result
}

/**
 * Check-out một phần (Partial Checkout)
 * Endpoint: POST /check-in/partial-check-out/{checkinId}
 * Body: { guestsToCheckout: ["Khách 1", "Khách 2"] }
 */
export const partialCheckout = async (checkinId: number, guestsToCheckout: string[]) => {
  const response = await api.post(`/check-in/partial-check-out/${checkinId}`, {
    guestsToCheckout
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Lỗi khi check-out một phần')
  }

  const result = await response.json()
  return result.data || result
}

/**
 * Tìm cư dân (Resident) để check-in
 * Endpoint: POST /check-in/find-resident
 */
export const findResident = async (data: { qrCode?: string; faceDescriptor?: number[] }) => {
  const response = await api.post('/check-in/find-resident', data)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Lỗi khi tìm cư dân')
  }
  
  const result = await response.json()
  return result.data || result
}

