// services/dashboardService.ts
import { api } from '../utils/api';

export type GroupBy = "day" | "month" | "year";

export const getDashboardData = async (groupBy: GroupBy) => {
  const queryParams = new URLSearchParams({ groupBy });
  const response = await api.get(`/dashboard/getDashboardData?${queryParams.toString()}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Lỗi khi lấy dữ liệu dashboard');
  }
  const result = await response.json();
  return result.data;
};
