import { useEffect, useState } from "react";
import AdminStatCard from "../../components/AdminStatCard";
import AdminChart from "../../components/AdminChart";
import { FileText, BarChart2, Users } from "lucide-react";
import { getDashboardData, GroupBy } from "../../api/dashboard.api";
import { formatCurrency } from "../../utils/formatters";

export default function AdminPage() {
  const [groupBy, setGroupBy] = useState<GroupBy>("month");
  const [fromDate, setFromDate] = useState<string>();
  const [toDate, setToDate] = useState<string>();
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getDashboardData({
        groupBy,
        fromDate,
        toDate,
      });

      setDashboard(res);
    };

    fetchData();
  }, [groupBy, fromDate, toDate]);

  if (!dashboard) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* STAT */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AdminStatCard
          title="Tổng lượt check-in hôm nay"
          value={dashboard.totalCheckInsToday}
          icon={FileText}
        />
        <AdminStatCard
          title="Doanh thu hôm nay"
          value={formatCurrency(dashboard.totalRevenueToday)}
          icon={BarChart2}
          highlight
        />
        <AdminStatCard
          title="Cư dân đang sử dụng dịch vụ"
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
