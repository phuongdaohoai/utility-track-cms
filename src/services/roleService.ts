import { API_BASE_URL } from '../utils/url';

export interface Role {
  id: number;
  roleName: string;
  version?: number;
}

const getAll = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/roles/getAll`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    throw new Error('Lỗi khi lấy danh sách vai trò');
  }

  return response.json();
};

const roleService = {
  getAll,
};

export default roleService;