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
  
 
  const token = localStorage.getItem('accessToken')

 
  const endpoint = type === 'staff' ? '/staff/getAll' : '/residents/getAll'

 
  const queryParams = new URLSearchParams({
    search: query,             
    page: page.toString(),
    pageSize: pageSize.toString(),
  })

  try {
   
    const response = await fetch(`${API_URL}${endpoint}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
       
        'Authorization': token ? `Bearer ${token}` : '',
      },
    })

    if (!response.ok) {
     
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Lỗi khi lấy danh sách ${type}`)
    }

   
    const data = await response.json()

   
    return {
      items: data.data.items || [], 
      total: data.data.totalItem || 0, 
      page : data.data.page || page,
      pageSize : data.data.pageSize || pageSize,
    }

  } catch (error) {
    console.error('Fetch users error:', error)
    
    throw error
  }
}

export default { fetchUsers }