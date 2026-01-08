// services/staffService.ts
import { api } from '../utils/api';

export interface Staff {
  staffId: number;
  fullName: string;
  phone: string;
  email: string;
  role: {
    id: number;
    roleName: string;
  } | null;
  status: number; // 1: Active, 0: Inactive
  avatar?: string | File;
  roleId: number;
  version: number;
}

export interface UpdateStaffPayload {
  staffId: number;
  fullName: string;
  phone: string;
  email: string;
  status: number;
  roleId: number;
  version: number;
  avatar?: string;
  password?: string;
}

export interface CreateStaffPayload {
  fullName: string;
  phone: string;
  email: string;
  roleId: number;
  avatar?: File;
  status?: number;
}

const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.upload('/upload/avatar', formData);
  return response;
};

const create = async (data: any) => {
 
  const response = await api.post('/staff/create', data);

  return response;
};

const update = async (data: any) => {
  const response = await api.put(`/staff/update/${data.staffId}`, data);
  return response;
};

const getById = async (id: number | string) => {
  const response = await api.get(`/staff/getById/${id}`);

  return response;
};

const deleteStaff = async (id: number | string) => {
  const response = await api.del(`/staff/delete/${id}`);

  return response;
};

const staffService = {
  getById,
  create,
  update,
  delete: deleteStaff,
  uploadAvatar
};

export default staffService;