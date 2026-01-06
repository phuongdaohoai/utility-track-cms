import { useEffect, useState } from "react";
import AdminStatCard from "../../components/AdminStatCard";
import AdminChart from "../../components/AdminChart";
import { FileText, BarChart2, Users } from "lucide-react";
import { getDashboardData, GroupBy } from "../../api/dashboard.api";
import { formatCurrency } from "../../utils/formatters";
import { useLocale } from "../../i18n/LocaleContext";

export default function AdminPage() {
  const { t } = useLocale();
  const [groupBy, setGroupBy] = useState<GroupBy>("month");
  const [fromDate, setFromDate] = useState<string>();
  const [toDate, setToDate] = useState<string>();
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Nếu groupBy là "day", chỉ gọi API khi có đủ cả fromDate và toDate
      if (groupBy === "day") {
        if (!fromDate || !toDate) {
          // Không gọi API nếu thiếu một trong hai ngày, nhưng không clear dashboard
          // để người dùng vẫn có thể tương tác và chọn lại ngày
          return;
        }
      }

      const res = await getDashboardData({
        groupBy,
        fromDate,
        toDate,
      });

      setDashboard(res);
    };

    fetchData();
  }, [groupBy, fromDate, toDate]);

  // Chỉ hiển thị loading khi lần đầu load (dashboard chưa có dữ liệu)
  if (!dashboard) return <div>{t.common.loading}</div>;

  return (
    <div className="space-y-6">
      {/* STAT */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AdminStatCard
          title={t.dashboard.totalCheckInsToday}
          value={dashboard.totalCheckInsToday}
          icon={FileText}
        />
        <AdminStatCard
          title={t.dashboard.totalRevenueToday}
          value={formatCurrency(dashboard.totalRevenueToday)}
          icon={BarChart2}
          highlight
        />
        <AdminStatCard
          title={t.dashboard.residentsCurrentlyInArea}
          value={dashboard.residentsCurrentlyInArea}
          icon={Users}
        />
      </div>

      {/* CHART */}
      <AdminChart
        data={dashboard.serviceUsageChart || []}
        groupBy={groupBy}
        fromDate={fromDate}
        toDate={toDate}
        onChangeGroupBy={setGroupBy}
        onChangeFromDate={setFromDate}
        onChangeToDate={setToDate}
      />
    </div>
  );
}
