import type { User } from '../types'
import axiosClient from './axiosClient';
export interface FetchUsersParams {
  type: 'residents' | 'staff'
  query?: string
  page?: number
  pageSize?: number
  filters?: any[];
}

export interface FetchUsersResult {
  items: User[]
  total: number
  page: number
  pageSize: number
}
export interface SearchSuggestionParams {
  type: 'residents' | 'staff'
  field: string
  keyword: string
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const getHeaders = () => {
  const token = localStorage.getItem('accessToken')
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  }
}
const fetchUsers = async (params: FetchUsersParams): Promise<FetchUsersResult> => {
const { type, query = '', page = 1, pageSize = 10, filters } = params
  
  const endpoint = type === 'staff' ? '/staff/getAll' : '/residents/getAll'

  const queryParams = new URLSearchParams({
    search: query,             
    page: page.toString(),
    pageSize: pageSize.toString(),
  })

  // 2. LOGIC QUAN TRỌNG: Gửi filters lên backend
  // Nếu có filters và mảng không rỗng, chuyển thành JSON string
  if (filters && filters.length > 0) {
    queryParams.append('filters', JSON.stringify(filters));
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}?${queryParams.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (!response.ok) {  
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Lỗi khi lấy danh sách ${type}`)
    }

    const data = await response.json() 
    
    // Logic map data (giữ nguyên logic cũ của bạn vì cấu trúc BE trả về staff/resident khác nhau)
    return {
      items: type === 'staff' ? data.data.items  : data.items , 
      total: type === 'staff' ? data.data.totalItem : data.totalItem, 
      page : type === 'staff' ? data.data.page : data.page,
      pageSize : type === 'staff' ? data.data.pageSize : data.pageSize,
    }

  } catch (error) {
    console.error('Fetch users error:', error)
    throw error
  }
}
const searchSuggestions = async (params: SearchSuggestionParams): Promise<{ items: User[] }> => {
  const { type, field, keyword } = params
  const endpoint = type === 'staff' ? '/staff/getAll' : '/residents/getAll'

 const queryParams = new URLSearchParams({
    page: '1',
    pageSize: '20', 
  })

   queryParams.append("search", keyword); 

  try {
    const response = await fetch(`${API_URL}${endpoint}?${queryParams.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (!response.ok) return { items: [] } // Lỗi thì trả về rỗng, không throw để tránh crash UI

    const data = await response.json()

     const items = type === 'staff' ? (data.data?.items || []) : (data.items || [])
    
    return { items }

  } catch (error) {
    console.error('Search suggestion error:', error)
    return { items: [] }
  }
}
export default { fetchUsers, searchSuggestions }