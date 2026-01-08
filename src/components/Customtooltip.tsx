import { GroupBy } from "../api/dashboard.api"

interface TooltipItem {
  name: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipItem[]
  label?: string
  groupBy: GroupBy
  formatPeriod: (value: string, groupBy: GroupBy) => string
}

const CustomTooltip = ({
  active,
  payload,
  label,
  groupBy,
  formatPeriod,
}: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="max-h-64 w-64 overflow-y-auto rounded-lg border bg-white p-3 text-sm shadow-lg" style={{ pointerEvents: "auto" }} >
      <div className="mb-2 font-semibold text-gray-800">
        {label ? formatPeriod(label, groupBy) : ""}
      </div>

      <div className="space-y-1">
        {payload
          .filter(item => item.value > 0)
          .sort((a, b) => b.value - a.value)
          .map((item, index) => (
            <div
              key={index}
              className="flex items-start justify-between gap-2"
            >
              <span
                className="truncate text-gray-600"
                title={item.name}
              >
                {item.name}
              </span>

              <span
                className="font-medium"
                style={{ color: item.color }}
              >
                {item.value}
              </span>
            </div>
          ))}
      </div>
    </div>
  )
}

export default CustomTooltip
