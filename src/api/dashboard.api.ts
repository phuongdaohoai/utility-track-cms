import axios from "axios";

const BASE_URL = "http://localhost:3000";

export type GroupBy = "day" | "month" | "year";

export const getDashboardData = async (groupBy: GroupBy) => {
  const res = await axios.get(
    `${BASE_URL}/dashboard/getDashboardData`,
    { params: { groupBy } }
  );
  return res.data.data;
};
