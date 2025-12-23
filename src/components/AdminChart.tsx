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
import { useState, useRef, useEffect } from "react";

/* ===================== TYPES ===================== */

type GroupByValue = "day" | "month" | "year";

interface Props {
  data: any[];
  groupBy: GroupByValue;
  onChangeGroupBy: (value: GroupByValue) => void;
}

/* ===================== CONSTANTS ===================== */

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
];

const GROUP_OPTIONS: { label: string; value: GroupByValue }[] = [
  { label: "Năm", value: "year" },
  { label: "Tháng", value: "month" },
  { label: "Ngày", value: "day" },
];

/* ===================== DROPDOWN ===================== */

function GroupByDropdown({
  value,
  onChange,
}: {
  value: GroupByValue;
  onChange: (v: GroupByValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = GROUP_OPTIONS.find(o => o.value === value);

  return (
    <div ref={ref} className="relative w-[120px] text-sm">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="
          flex w-full items-center justify-between
          rounded-md
          border border-gray-300
          bg-white
          px-3 py-2
          text-gray-700
          hover:border-gray-400
        "
      >
        <span>{current?.label}</span>

        {/* Chevron */}
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown list */}
      {open && (
        <div
          className="
            absolute z-50 mt-1 w-full
            rounded-md
            border border-gray-200
            bg-white
            shadow-sm
          "
        >
          {GROUP_OPTIONS.map(option => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className="
                cursor-pointer
                px-3 py-2
                text-gray-700
                hover:text-blue-600
              "
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===================== CHART HELPERS ===================== */

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

/* ===================== MAIN COMPONENT ===================== */

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
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Biểu đồ</h2>

        <GroupByDropdown
          value={groupBy}
          onChange={onChangeGroupBy}
        />
      </div>

      {/* Chart */}
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
