import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "@/features/counter/counterSlice";
import checkoutReducer from "@/features/Checkout/CheckoutSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    checkout: checkoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
