// services/dashboardService.ts
import { api } from "../utils/api";

/**
 * 🔴 GroupBy THEO ĐÚNG BE
 * enum DashboardGroupBy bên BE
 */
export type GroupBy =
  | "day"
  | "month"
  | "quarter"
  | "halfYear"
  | "year";

/**
 * Params gửi cho BE
 */
interface DashboardParams {
  groupBy: GroupBy;
  fromDate?: string;
  toDate?: string;
}

/**
 * Gọi API dashboard
 */
export const getDashboardData = async (params: DashboardParams) => {
  const queryParams = new URLSearchParams();

  queryParams.append("groupBy", params.groupBy);

  if (params.fromDate) {
    queryParams.append("fromDate", params.fromDate);
  }

  if (params.toDate) {
    queryParams.append("toDate", params.toDate);
  }

  const response = await api.get(
    `/dashboard/getDashboardData?${queryParams.toString()}`
  );


  return response.data;
};
