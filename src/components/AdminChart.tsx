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
import { useState } from "react";

interface Props {
  data: any[];
  groupBy: string;
  onChangeGroupBy: (value: "day" | "month" | "year") => void;
}

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-white px-4 py-2 shadow">
      <p className="mb-2 font-semibold text-blue-600">{label}</p>

      {payload.map((item: any) => (
        <div key={item.dataKey} className="flex items-center gap-2 text-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.name}:</span>
          <span className="font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

const CustomXAxisTick = ({ x, y, payload, index, activeIndex }: any) => {
  const isActive = index === activeIndex;

  return (
    <text
      x={x}
      y={y + 14}
      textAnchor="middle"
      fill={isActive ? "#2563eb" : "#374151"}
      fontSize={12}
      fontWeight={isActive ? 600 : 400}
    >
      {payload.value}
    </text>
  );
};

export default function AdminChart({
  data,
  groupBy,
  onChangeGroupBy,
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!data?.length) return null;

  const services = Object.keys(data[0]).filter(
    key => key !== "Period"
  );

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Biểu đồ</h2>

        <select
          value={groupBy}
          onChange={e => onChangeGroupBy(e.target.value as any)}
          className="w-[130px] rounded-md border px-4 py-2 text-sm"
        >
          <option value="year">Năm</option>
          <option value="month">Tháng</option>
          <option value="day">Ngày</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          barSize={10}
          barGap={3}
          barCategoryGap={28}
          onMouseMove={(state: any) => {
            if (state?.activeTooltipIndex !== undefined) {
              setActiveIndex(state.activeTooltipIndex);
            }
          }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="Period"
            tick={(props) => (
              <CustomXAxisTick
                {...props}
                activeIndex={activeIndex}
              />
            )}
          />

          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" />

          {services.map((service, index) => (
            <Bar
              key={service}
              dataKey={service}
              name={service}
              fill={COLORS[index % COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
