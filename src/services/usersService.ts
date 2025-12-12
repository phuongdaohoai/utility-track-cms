import type { User } from '../types'

export interface FetchUsersParams {
  type: 'residents' | 'staff'
  query?: string
  page?: number
  pageSize?: number
}

export interface FetchUsersResult {
  items: User[]
  total: number
  page: number
  pageSize: number
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const fetchUsers = async (params: FetchUsersParams): Promise<FetchUsersResult> => {
  const { type, query = '', page = 1, pageSize = 10 } = params
  
  // 1. Lấy token từ localStorage
  const token = localStorage.getItem('accessToken')

  // 2. Xác định Endpoint dựa trên 'type' (residents hoặc staff)
  // Nếu type là 'staff' -> /staff/getAll, ngược lại -> /residents/getAll
  const endpoint = type === 'staff' ? '/staff/getAll' : '/residents/getAll'

  // 3. Tạo URLSearchParams để xử lý query string an toàn
  const queryParams = new URLSearchParams({
    search: query,             // query bên FE map sang 'search' bên BE
    page: page.toString(),
    pageSize: pageSize.toString(),
  })

  try {
    // 4. Gọi API thực tế
    const response = await fetch(`${API_URL}${endpoint}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Gắn token vào Authorization header
        'Authorization': token ? `Bearer ${token}` : '',
      },
    })

    if (!response.ok) {
      // Xử lý lỗi nếu server trả về 401, 403, 500...
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Lỗi khi lấy danh sách ${type}`)
    }

    // 5. Lấy dữ liệu JSON trả về
    // Giả sử Backend trả về format: { data: User[], total: number }
    const data = await response.json()

    // Map dữ liệu server về đúng format của Frontend (FetchUsersResult)
    // Lưu ý: Cần kiểm tra xem BE trả về biến tên là 'data', 'items' hay 'users' để sửa lại cho đúng
    return {
      items: data.data || [], // Fallback mảng rỗng nếu không có data
      total: data.total || 0, // Fallback 0 nếu không có total
      page,
      pageSize,
    }

  } catch (error) {
    console.error('Fetch users error:', error)
    // Ném lỗi tiếp để Redux (createAsyncThunk) bắt được và chuyển sang state 'failed'
    throw error
  }
}

export default { fetchUsers }