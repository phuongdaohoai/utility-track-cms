import { ChangeEvent } from "react";
import { GroupBy } from "../api/dashboard.api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* ================= FORMAT TIME ================= */

function formatPeriod(period: string | number | Date | any, groupBy: GroupBy) {
  if (!period) return "";

  // Convert period to string if it's not already
  const periodStr = typeof period === "string" ? period : String(period);

  if (groupBy === "day") {
    const date = new Date(periodStr);
    if (isNaN(date.getTime())) return periodStr; // Invalid date

    // Chỉ hiển thị ngày, bỏ giờ
    const dd = date.getDate().toString().padStart(2, "0");
    const MM = (date.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = date.getFullYear();

    return `${dd}/${MM}/${yyyy}`;
  }

  if (groupBy === "month") {
    // Ensure periodStr is a string before splitting
    if (typeof periodStr !== "string") return String(periodStr);
    const parts = periodStr.split("-");
    if (parts.length >= 2) {
      const [year, month] = parts;
      return `${month}/${year}`;
    }
    return periodStr;
  }

  return periodStr;
}

/* ================= UI ================= */

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
];

interface Props {
  data: any[];
  groupBy: GroupBy;
  fromDate?: string;
  toDate?: string;
  onChangeGroupBy: (value: GroupBy) => void;
  onChangeFromDate: (value?: string) => void;
  onChangeToDate: (value?: string) => void;
}

export default function AdminChart({
  data,
  groupBy,
  fromDate,
  toDate,
  onChangeGroupBy,
  onChangeFromDate,
  onChangeToDate,
}: Props) {
  const handleGroupByChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newGroupBy = e.target.value as GroupBy;
    onChangeGroupBy(newGroupBy);

    // Khi chọn "day", tự động set mặc định 7 ngày gần nhất
    if (newGroupBy === "day") {
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);

      // Format thành YYYY-MM-DD
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      onChangeFromDate(formatDate(sevenDaysAgo));
      onChangeToDate(formatDate(today));
    }
  };

  const serviceKeys = Array.from(
    data.reduce((keys, item) => {
      Object.keys(item).forEach((key) => {
        if (key !== "Period") {
          keys.add(key);
        }
      });
      return keys;
    }, new Set<string>())
  );

  return (
    <div className="space-y-4 rounded-lg bg-white p-4 shadow">
      {/* ===== FILTER ===== */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={groupBy}
          onChange={handleGroupByChange}
          className="
    rounded
    border
    px-3
    py-2
    pr-10
    bg-white
    text-gray-800
    focus:outline-none
    focus:ring-0
    focus:border-gray-400
    hover:bg-gray-100
    hover:border-gray-400
    appearance-none
    cursor-pointer
  "
        >
          <option value="day">Tùy chọn thời gian</option>
          <option value="month">Tháng</option>
          <option value="quarter">Quý</option>
          <option value="halfYear">Nửa năm</option>
          <option value="year">Năm</option>
        </select>



        {groupBy === "day" && (
          <>
            <input
              type="date"
              value={fromDate || ""}
              onChange={(e) => onChangeFromDate(e.target.value)}
              className="rounded border px-3 py-2"
            />

            <input
              type="date"
              value={toDate || ""}
              onChange={(e) => onChangeToDate(e.target.value)}
              className="rounded border px-3 py-2"
            />
          </>
        )}

      </div>

      {/* ===== CHART ===== */}
      <div className="h-72">
        {/* Kiểm tra nếu groupBy là "day" và thiếu fromDate hoặc toDate */}
        {groupBy === "day" && (!fromDate || !toDate) ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">
                Vui lòng chọn đủ cả 2 ngày
              </p>
              <p className="text-sm text-gray-400">
                Chọn ngày bắt đầu và ngày kết thúc để xem dữ liệu
              </p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            Không có dữ liệu
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={14} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="Period"
                tickFormatter={(value) => formatPeriod(value, groupBy)}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => formatPeriod(value as string, groupBy)}
              />
              <Legend />

              {serviceKeys.map((key, index) => (
                <Bar
                  key={String(key)}
                  dataKey={String(key)}
                  name={String(key)}
                  fill={COLORS[index % COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
