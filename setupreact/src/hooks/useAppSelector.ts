import { useSelector } from "react-redux";
import type { RootState } from "../app/store.js";

export const useAppSelector = useSelector.withTypes<RootState>();
