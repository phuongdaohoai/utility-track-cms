// services/roleService.ts
import { api } from '../utils/api';

export interface Role {
  id: number;
  roleName: string;
  version?: number;
}

const getAll = async () => {
  const response = await api.get('/roles/getAll');

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Lỗi khi lấy danh sách vai trò');
  }

  return response.json();
};

const roleService = {
  getAll,
};

export default roleService;