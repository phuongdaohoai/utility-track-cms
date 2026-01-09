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
  representative?: string;
  phoneNumber?: string;
  quantity?: number;
  members?: CheckInMember[];
  additionalGuests?: string[] | string;
}

// Staff check-in item (không có room/serviceName)
export interface StaffCheckInItem {
  id: number;
  displayName: string;
  phone: string;
  checkInTime: string;
  checkOutTime: string | null;
  method: string | null;
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
  return response; 
};

// Staff check-ins - chỉ để xem danh sách nhân viên đang check-in
const getStaffCheckIns = async (page = 1, pageSize = 10, search = "") => {
  const params: any = { page, pageSize };
  if (search) {
    params.search = search;
  }

  const response = await api.get('/check-in/get-all-check-ins-staff', {
    params,
  });
  return response;
};

// 2. Checkout (Mới thêm)
const checkout = async (checkinId: number) => {
  const response = await api.post(`/check-in/current-check-outs/${checkinId}`, {
    checkinId: checkinId
  });
  return response;
};

// 3. Checkout kèm số lượng
const checkoutWithQuantity = async (checkinId: number, quantity: number) => {
  const response = await api.post(`/check-in/current-check-outs/${checkinId}`, {
    checkinId,
    quantity
  });
  return response;
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
  return response;
};

const checkInService = {
  getCurrentCheckIns,
  getStaffCheckIns,
  checkout,
  checkoutWithQuantity, // legacy
  partialCheckoutByGuests,
};

export default checkInService;