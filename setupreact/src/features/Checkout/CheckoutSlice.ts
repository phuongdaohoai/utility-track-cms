import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface CheckinItem {
  id: string;
  name: string;
  avatar: string;
  type: "resident" | "guest";
  service: string;
  timeIn: string;
}

interface CheckoutState {
  list: CheckinItem[];
  search: string;
  filter: "all" | "resident" | "guest";
}

const initialState: CheckoutState = {
  list: [],
  search: "",
  filter: "all",
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setList(state, action: PayloadAction<CheckinItem[]>) {
      state.list = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setFilter(state, action: PayloadAction<"all" | "resident" | "guest">) {
      state.filter = action.payload;
    },
    checkoutById(state, action: PayloadAction<string>) {
      state.list = state.list.filter((i) => i.id !== action.payload);
    },
  },
});

export const { setList, setSearch, setFilter, checkoutById } =
  checkoutSlice.actions;

export default checkoutSlice.reducer;
