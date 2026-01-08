import { ChangeEvent, useEffect } from "react"
import { GroupBy } from "../api/dashboard.api"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { useLocale } from "../i18n/LocaleContext"
import CustomTooltip from "./Customtooltip"
import ChartLegend from "./ChartLegend"


const SERVICE_COLOR_MAP: Record<string, string> = {}

function generateColor(index: number) {
  const hue = (index * 137.508) % 360 // golden angle
  return `hsl(${hue}, 70%, 50%)`
}

function getServiceColor(service: string) {
  if (!SERVICE_COLOR_MAP[service]) {
    const index = Object.keys(SERVICE_COLOR_MAP).length
    SERVICE_COLOR_MAP[service] = generateColor(index)
  }
  return SERVICE_COLOR_MAP[service]
}


/* ================= FORMAT TIME ================= */

function formatPeriod(period: string, groupBy: GroupBy) {
  if (!period) return ""

  if (groupBy === "day") {
    const date = new Date(period)
    if (isNaN(date.getTime())) return period

    const dd = String(date.getDate()).padStart(2, "0")
    const mm = String(date.getMonth() + 1).padStart(2, "0")
    const yyyy = date.getFullYear()

    return `${dd}/${mm}/${yyyy}`
  }

  if (groupBy === "month") {
    const [year, month] = period.split("-")
    return `${month}/${year}`
  }

  return period
}

/* ================= PROPS ================= */

interface Props {
  data: any[]
  groupBy: GroupBy
  fromDate?: string
  toDate?: string
  onChangeGroupBy: (value: GroupBy) => void
  onChangeFromDate: (value?: string) => void
  onChangeToDate: (value?: string) => void
}

/* ================= COMPONENT ================= */

export default function AdminChart({
  data,
  groupBy,
  fromDate,
  toDate,
  onChangeGroupBy,
  onChangeFromDate,
  onChangeToDate,
}: Props) {
  const { t } = useLocale()

  /* ===== RESET COLOR MAP KHI ĐỔI GROUP ===== */
  useEffect(() => {
    Object.keys(SERVICE_COLOR_MAP).forEach(k => delete SERVICE_COLOR_MAP[k])
  }, [groupBy])

  /* ===== GROUP BY CHANGE ===== */
  const handleGroupByChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as GroupBy
    onChangeGroupBy(value)

    if (value === "day") {
      const today = new Date()
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(today.getDate() - 7)

      const format = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`

      onChangeFromDate(format(sevenDaysAgo))
      onChangeToDate(format(today))
    }
  }

  /* ===== COLLECT SERVICE KEYS ===== */
  const serviceKeys: string[] = Array.from(
    data.reduce((set: Set<string>, item: Record<string, any>) => {
      Object.keys(item).forEach((key: string) => {
        if (key !== "Period") set.add(key)
      })
      return set
    }, new Set<string>())
  )


  /* ===== LEGEND ITEMS ===== */
  const legendItems = serviceKeys.map(key => ({
    name: key,
    color: getServiceColor(key),
  }))

  /* ================= RENDER ================= */

  return (
    <div className="space-y-4 rounded-lg bg-white p-4 shadow">
      {/* ===== FILTER ===== */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={groupBy}
          onChange={handleGroupByChange}
          className="rounded border px-3 py-2 bg-white"
        >
          <option value="day">{t.adminChart.timeRange}</option>
          <option value="month">{t.adminChart.month}</option>
          <option value="quarter">{t.adminChart.quarter}</option>
          <option value="halfYear">{t.adminChart.halfYear}</option>
          <option value="year">{t.adminChart.year}</option>
        </select>

        {groupBy === "day" && (
          <>
            <input
              type="date"
              value={fromDate || ""}
              onChange={e => onChangeFromDate(e.target.value)}
              className="rounded border px-3 py-2"
            />
            <input
              type="date"
              value={toDate || ""}
              onChange={e => onChangeToDate(e.target.value)}
              className="rounded border px-3 py-2"
            />
          </>
        )}
      </div>

      {/* ===== CHART ===== */}
      <div className="h-72">
        {groupBy === "day" && (!fromDate || !toDate) ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">
                {t.adminChart.selectBothDates}
              </p>
              <p className="text-sm text-gray-400">
                {t.adminChart.selectDatesDescription}
              </p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            {t.adminChart.noData}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={14} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="Period"
                tickFormatter={v => formatPeriod(v, groupBy)}
              />
              <YAxis />

              <Tooltip
                wrapperStyle={{ pointerEvents: "auto" }}
                content={
                  <CustomTooltip
                    groupBy={groupBy}
                    formatPeriod={formatPeriod}
                  />
                }
              />

              {serviceKeys.map(key => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={getServiceColor(key)}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>


      {/* ===== LEGEND ===== */}
      <ChartLegend items={legendItems} />
    </div>
  )
}
