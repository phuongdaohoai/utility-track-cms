// services/residentsService.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

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
  delete: deleteResident,
};