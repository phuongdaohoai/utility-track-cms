import { api } from '../utils/api';

export interface CheckInMember {
  id?: number | string;
  fullName?: string;
  name?: string;
}

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
  representative?: string;
  phoneNumber?: string;
  phone?: string;
  quantity?: number;
  members?: CheckInMember[];
  additionalGuests?: string[] | string;
}

// 1. Get List
const getCurrentCheckIns = async (page = 1, pageSize = 10, search = "", type?: "resident" | "guest") => {
  const params: any = { page, pageSize };
  if (search) {
    params.search = search;
  }
  if (type) {
    params.type = type;
  }
  
  console.log("API Request params:", params); // Debug log
  
  const response = await api.get('/check-in/current-check-ins', {
    params
  });
  
  if (!response.ok) throw new Error("Lỗi tải dữ liệu");
  const result = await response.json();
  console.log("API Response:", result); // Debug log
  return result; 
};

// 2. Checkout (Mới thêm)
const checkout = async (checkinId: number) => {
  const response = await api.post(`/check-in/current-check-outs/${checkinId}`, {
    checkinId: checkinId
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Lỗi khi thực hiện checkout");
  }

  return response.json();
};

// 3. Checkout kèm số lượng
const checkoutWithQuantity = async (checkinId: number, quantity: number) => {
  const response = await api.post(`/check-in/current-check-outs/${checkinId}`, {
    checkinId,
    quantity
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Lỗi khi thực hiện checkout");
  }
  return response.json();
};

// 4. Checkout theo danh sách khách (không checkout đại diện)
const partialCheckoutByGuests = async (
  checkinId: number,
  guestsToCheckout: string[]
) => {
  const response = await api.post(
    `/check-in/partial-check-out/${checkinId}`,
    {
      guestsToCheckout,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Lỗi khi thực hiện checkout một phần");
  }
  return response.json();
};

const checkInService = {
  getCurrentCheckIns,
  checkout,
  checkoutWithQuantity, // legacy
  partialCheckoutByGuests,
};

export default checkInService;