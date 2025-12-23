import { API_BASE_URL } from '../utils/url';

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
  avatar?: string |File;
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
const uploadAvatar = async (file: File) => {
  const token = localStorage.getItem('accessToken');
  const formData = new FormData();
  formData.append('file', file); // Field name phải khớp backend

  const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
    method: 'POST',
    headers: { 'Authorization': token ? `Bearer ${token}` : '' },
    body: formData,
  });

  if (!response.ok) throw new Error('Lỗi khi upload ảnh');
  return response.json();
};

const create = async (data: any) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${API_BASE_URL}/staff/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Đảm bảo header JSON
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(data), 
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(Array.isArray(error.message) ? error.message.join(', ') : error.message || 'Lỗi khi tạo nhân viên');
  }

  return response.json();
};


const update = async (data: any) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/staff/update/${data.staffId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json', // 👈 Quan trọng: JSON
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Lỗi khi cập nhật nhân viên');
  }
  return response.json();
};
const getById = async (id: number | string) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/staff/getById/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Lỗi khi lấy thông tin nhân viên');
  }

  return response.json();
};
const deleteStaff = async (id: number | string) => {
  const token = localStorage.getItem('accessToken');

  const response = await fetch(`${API_BASE_URL}/staff/delete/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Lỗi khi xóa nhân viên');
  }

  return response.json();
};



// services/staffService.ts - Thêm vào cuối file
export interface CreateStaffPayload {
  fullName: string;
  phone: string;
  email: string;
  roleId: number;
  avatar?: File; // Optional file
  status?: number; // Default: 1 (Active)
}


// Cập nhật staffService export
const staffService = {
  getById,
  create,
  update,
  delete: deleteStaff,
  uploadAvatar
};

export default staffService;