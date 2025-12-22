// services/residentsService.ts
import { API_BASE_URL } from '../utils/url';
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
const getById = async (id: number | string) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/residents/getById/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Lỗi khi lấy thông tin cư dân');
  }

  return response.json();
};


const update = async (id: number | string, data: FormData) => {
  const token = localStorage.getItem('accessToken');
 
  const response = await fetch(`${API_BASE_URL}/residents/update/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      // FormData tự set Content-Type
    },
    body: data,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Lỗi khi cập nhật cư dân');
  }

  return response.json();
};
const deleteResident = async (id: number | string) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/residents/delete/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

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
};