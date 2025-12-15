
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export interface Staff {
  staffId: number;
  fullName: string;
  phone: string;
  email: string;
  role: {
    roleName: string;
  } | null;
  status: number; // 1: Active, 0: Inactive
  avatar: string | null;
  roleId: number;
}

export interface UpdateStaffPayload {
  staffId: number;
  fullName: string;
  phone: string;
  status: number;
  roleId: number;
  // avatar sẽ xử lý riêng nếu cần upload file multipart
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
  const response = await fetch(`${API_BASE_URL}/staff/update`, {
    method: 'PUT', 
    headers: {
      'Content-Type': 'application/json',
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
const staffService = {
  getById,
  update,
  delete: deleteStaff,
};

export default staffService;