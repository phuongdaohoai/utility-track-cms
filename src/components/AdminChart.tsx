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

function formatPeriod(period: string, groupBy: GroupBy) {
  if (!period) return "";

  const date = new Date(period);

  if (groupBy === "day") {
    const hh = date.getHours().toString().padStart(2, "0");
    const mm = date.getMinutes().toString().padStart(2, "0");
    const dd = date.getDate().toString().padStart(2, "0");
    const MM = (date.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = date.getFullYear();

    return `${hh}:${mm} - ${dd}/${MM}/${yyyy}`;
  }

  if (groupBy === "month") {
    const [year, month] = period.split("-");
    return `${month}/${year}`;
  }

  return period;
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
    onChangeGroupBy(e.target.value as GroupBy);
  };

  const serviceKeys =
    data.length > 0
      ? Object.keys(data[0]).filter((k) => k !== "Period")
      : [];

  return (
    <div className="space-y-4 rounded-lg bg-white p-4 shadow">
      {/* ===== FILTER ===== */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={groupBy}
          onChange={(e) => onChangeGroupBy(e.target.value as GroupBy)}
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
        {data.length === 0 ? (
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
                  key={key}
                  dataKey={key}
                  name={key}
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
