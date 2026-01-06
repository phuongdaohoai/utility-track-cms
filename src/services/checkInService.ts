import { api } from '../utils/api';

export interface CheckInItem {
  id: number;
  displayName: string;
  room: string;
  phone: string;
  totalPeople: number;
  serviceName: string;
  checkInTime: string;
  method: string | null;
  additionalGuests?: string[]; // Thêm trường này
}

// 1. Get List
const getCurrentCheckIns = async (page = 1, pageSize = 10, search = "") => {
  const response = await api.get('/check-in/current-check-ins', {
    params: { page, pageSize, search }
  });
  
  if (!response.ok) throw new Error("Lỗi tải dữ liệu");
  return response.json(); 
};

// 2. Checkout (Mới thêm)
const checkout = async (checkinId: number) => {
  // Gọi POST theo đường dẫn bạn cung cấp
  // Body bao gồm { checkinId: ... }
  const response = await api.post(`/check-in/current-check-outs/${checkinId}`, {
    checkinId: checkinId
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Lỗi khi thực hiện checkout");
  }

  return response.json();
};

const checkInService = {
  getCurrentCheckIns,
  checkout, // Nhớ export hàm này
};

export default checkInService;