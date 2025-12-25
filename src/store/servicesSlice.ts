// store/servicesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Service {
  id: number;              // 👈 PHẢI LÀ id
  serviceName: string;
  price: number;
  description: string;
  status: 0 | 1;
  capacity: number;
  updatedAt?: string;
  version?: number;
}

interface ServicesState {
  services: Service[];
  loading: boolean;
  error: string | null;
}

const initialState: ServicesState = {
  services: [],
  loading: false,
  error: null,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setServices: (state, action: PayloadAction<Service[]>) => {
      state.services = action.payload;
      localStorage.setItem('services', JSON.stringify(action.payload));
      console.log('Set services:', action.payload);
    },
    updateService: (state, action: PayloadAction<Service>) => {
      state.services = state.services.map(s => s.id === action.payload.id ? action.payload : s);
      localStorage.setItem('services', JSON.stringify(state.services));
      console.log('Updated service:', action.payload);
    },
    deleteService: (state, action: PayloadAction<number>) => {
      state.services = state.services.filter(s => s.id !== action.payload);
      localStorage.setItem('services', JSON.stringify(state.services));
      console.log('Deleted service id:', action.payload);
    },
    addService: (state, action: PayloadAction<Service>) => {
      state.services = [...state.services, action.payload];
      localStorage.setItem('services', JSON.stringify(state.services));
      console.log('Added service:', action.payload);
    },
  },
});

export const { setServices, updateService, deleteService, addService } = servicesSlice.actions;
export default servicesSlice.reducer;