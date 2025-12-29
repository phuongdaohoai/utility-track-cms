import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";


export interface Resident {
  id: string;
  name: string;
  selected: boolean;
  isExtra: boolean; // người ngoài hộ
}

export interface CheckinState {
  apartment: string;       // căn hộ
  ownerName: string;       // chủ hộ
  serviceName: string;     // dịch vụ (bơi / gym…)
  method: string;          // phương thức checkin (thẻ / thủ công)
  checkinTime: string;     // thời điểm checkin
  residents: Resident[];   // danh sách cư dân
}

const initialState: CheckinState = {
  apartment: "",
  ownerName: "",
  serviceName: "",
  method: "Thủ công",       // mặc định theo yêu cầu
  checkinTime: "",
  residents: []
};

export const checkinSlice = createSlice({
  name: "checkin",
  initialState,
  reducers: {

    // Reset toàn bộ form checkin
    resetCheckin(state) {
      return { ...initialState };
    },

    // Set thông tin căn hộ, chủ hộ, dịch vụ...
    setCheckinInfo(
      state,
      action: PayloadAction<{
        apartment: string;
        ownerName: string;
        serviceName: string;
        method?: string;
      }>
    ) {
      state.apartment = action.payload.apartment;
      state.ownerName = action.payload.ownerName;
      state.serviceName = action.payload.serviceName;
      state.method = action.payload.method ?? "Thủ công";
      state.checkinTime = new Date().toISOString();
    },

    // Load danh sách cư dân có sẵn
    loadResidents(state, action: PayloadAction<Resident[]>) {
      state.residents = action.payload;
    },

    // Thêm người ngoài hộ
    addExtraResident(state) {
      state.residents.push({
        id: (Math.random() * 999999).toFixed(0),
        name: "",
        selected: false,
        isExtra: true,
      });
    },

    // Cập nhật tên (ô nhập liệu)
    updateResidentName(
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) {
      const person = state.residents.find((r) => r.id === action.payload.id);
      if (person) person.name = action.payload.name;
    },

    // Toggle chọn cư dân
    toggleResident(
      state,
      action: PayloadAction<{ id: string; selected: boolean }>
    ) {
      const person = state.residents.find((r) => r.id === action.payload.id);
      if (person) person.selected = action.payload.selected;
    },
  },
});

export const {
  resetCheckin,
  setCheckinInfo,
  loadResidents,
  addExtraResident,
  updateResidentName,
  toggleResident,
} = checkinSlice.actions;

export default checkinSlice.reducer;
