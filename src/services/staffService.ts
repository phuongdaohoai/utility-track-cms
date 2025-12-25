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

  if (!response.ok) throw new Error('Lỗi khi upload ảnh');
  return response.json();
};

const create = async (data: any) => {
 
  const response = await api.post('/staff/create', data);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = Array.isArray(error.message) 
      ? error.message.join(', ') 
      : error.message || 'Lỗi khi tạo nhân viên';
    throw new Error(message);
  }

  return response.json();
};

const update = async (data: any) => {
  const response = await api.put(`/staff/update/${data.staffId}`, data);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Lỗi khi cập nhật nhân viên');
  }
  return response.json();
};

const getById = async (id: number | string) => {
  const response = await api.get(`/staff/getById/${id}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Lỗi khi lấy thông tin nhân viên');
  }

  return response.json();
};

const deleteStaff = async (id: number | string) => {
  const response = await api.del(`/staff/delete/${id}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Lỗi khi xóa nhân viên');
  }

  return response.json();
};

const staffService = {
  getById,
  create,
  update,
  delete: deleteStaff,
  uploadAvatar
};

export default staffService;