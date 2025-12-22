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
const uploadAvatar = async (file: File) => {
  const token = localStorage.getItem('accessToken');
  const formData = new FormData();
  formData.append('file', file); // Field name phải khớp với Backend (UploadController)

  const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
     
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Lỗi khi upload ảnh');
  }else{
    alert(response);
  }

  return response.json(); 
};


const create = async (data: any) => {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${API_BASE_URL}/residents/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Tạo cư dân thất bại');
  return res.json();
};

const update = async (id: number, data: any) => {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${API_BASE_URL}/residents/update/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Cập nhật cư dân thất bại');
  return res.json();
};

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
  create,       
  uploadAvatar,
};