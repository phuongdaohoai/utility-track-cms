import { useDispatch } from "react-redux";
import type { AppDispatch } from "../app/store.js";

export const useAppDispatch = () => useDispatch<AppDispatch>();
