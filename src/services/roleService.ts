// services/roleService.ts
import { api } from '../utils/api';

export interface Role {
  id: number;
  roleName: string;
  version?: number;
}

const getAll = async () => {
  const response = await api.get('/roles/getAll');

  return response;
};

const roleService = {
  getAll,
};

export default roleService;