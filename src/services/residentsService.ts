// services/residentsService.ts
import { api } from '../utils/api';

export interface Resident {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  citizenCard: string;
  gender: string;
  birthday: string;
  apartment: {
    building: string;
    floorNumber: number;
    roomNumber: string;
  };
  qrCode: string;
  faceIdData: string;
  status: number;
  version: number;
  avatar: string | null;
}

const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  
  const response = await api.upload('/upload/avatar', formData);

  if (!response.ok) {
    throw new Error('Lỗi khi upload ảnh');
  }

  return response.json();
};

const create = async (data: any) => {
  // api.post tự xử lý JSON.stringify, Headers, Token
  const res = await api.post('/residents/create', data);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = Array.isArray(errorData.message)
        ? errorData.message.join(', ')
        : (errorData.message || 'Tạo cư dân thất bại');
    throw new Error(errorMessage);
  }
  return res.json();
};

const update = async (id: number, data: any) => {
  const res = await api.put(`/residents/update/${id}`, data);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = Array.isArray(errorData.message)
        ? errorData.message.join(', ')
        : (errorData.message || 'Cập nhật cư dân thất bại');
    throw new Error(errorMessage);
  }
  return res.json();
};

const getById = async (id: number | string) => {
  const response = await api.get(`/residents/getById/${id}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Lỗi khi lấy thông tin cư dân');
  }

  return response.json();
};

const deleteResident = async (id: number | string) => {
  const response = await api.del(`/residents/delete/${id}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Lỗi khi xóa cư dân');
  }

  return response.json();
};

export default {
  getById,
  update,
  delete: deleteResident,
  create,
  uploadAvatar,
};