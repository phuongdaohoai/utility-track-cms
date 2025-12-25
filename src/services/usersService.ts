// services/usersService.ts
import type { User } from '../types';
import { api } from '../utils/api';

export interface FetchUsersParams {
  type: 'residents' | 'staff';
  query?: string;
  page?: number;
  pageSize?: number;
  filters?: any[];
}

export interface FetchUsersResult {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SearchSuggestionParams {
  type: 'residents' | 'staff';
  field: string;
  keyword: string;
}

const fetchUsers = async (params: FetchUsersParams): Promise<FetchUsersResult> => {
  const { type, query = '', page = 1, pageSize = 10, filters } = params;
  
  const endpoint = type === 'staff' ? '/staff/getAll' : '/residents/getAll';

  const queryParams = new URLSearchParams({
    search: query,            
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (filters && filters.length > 0) {
    queryParams.append('filters', JSON.stringify(filters));
  }

  try {
    // Sử dụng api.get thay cho fetch thủ công
    const response = await api.get(`${endpoint}?${queryParams.toString()}`);

    if (!response.ok) {  
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Lỗi khi lấy danh sách ${type}`);
    }

    const data = await response.json();
    
    // Logic map data (giữ nguyên vì cấu trúc BE trả về staff/resident khác nhau)
    return {
      items: type === 'staff' ? data.data.items  : data.items, 
      total: type === 'staff' ? data.data.totalItem : data.totalItem, 
      page : type === 'staff' ? data.data.page : data.page,
      pageSize : type === 'staff' ? data.data.pageSize : data.pageSize,
    };

  } catch (error) {
    console.error('Fetch users error:', error);
    throw error;
  }
};

const searchSuggestions = async (params: SearchSuggestionParams): Promise<{ items: User[] }> => {
  const { type, keyword } = params;
  const endpoint = type === 'staff' ? '/staff/getAll' : '/residents/getAll';

  const queryParams = new URLSearchParams({
    page: '1',
    pageSize: '20', 
    search: keyword
  });

  try {
    const response = await api.get(`${endpoint}?${queryParams.toString()}`);

    if (!response.ok) return { items: [] }; // Lỗi thì trả về rỗng

    const data = await response.json();

    const items = type === 'staff' ? (data.data?.items || []) : (data.items || []);
    
    return { items };

  } catch (error) {
    console.error('Search suggestion error:', error);
    return { items: [] };
  }
};

export default { fetchUsers, searchSuggestions };