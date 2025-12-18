
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

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
  avatar?: File;
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
  avatar?: File;
  
}


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

const update = async (data: UpdateStaffPayload) => {
  const token = localStorage.getItem('accessToken');
  const formData = new FormData();
  
 
  formData.append('staffId', data.staffId.toString());
  formData.append('fullName', data.fullName);
  formData.append('phone', data.phone);
  formData.append('email', data.email);
  formData.append('roleId', data.roleId.toString());
  formData.append('status', data.status.toString());
  formData.append('version', data.version.toString());

  
  if (data.avatar instanceof File) {
    formData.append('avatar', data.avatar);
  }

 
  const response = await fetch(`${API_BASE_URL}/staff/update/${data.staffId}`, {
    method: 'PUT', 
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
   
    },
    body: formData, 
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Lỗi khi cập nhật nhân viên');
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

const create = async (data: CreateStaffPayload) => {
  const token = localStorage.getItem('accessToken');

  // Xử lý FormData nếu có file avatar
  let formData = new FormData();
  formData.append('fullName', data.fullName);
  formData.append('phone', data.phone);
  formData.append('email', data.email);
  formData.append('roleId', data.roleId.toString());
  formData.append('status', data.status?.toString() || '1');

  if (data.avatar) {
    formData.append('avatar', data.avatar);
  }

  const response = await fetch(`${API_BASE_URL}/staff/create`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Lỗi khi tạo nhân viên');
  }

  return response.json();
};

// Cập nhật staffService export
const staffService = {
  getById,
  create,
  update,
  delete: deleteStaff,
};

export default staffService;