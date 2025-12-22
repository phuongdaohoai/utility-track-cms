import { useEffect, useState } from "react";
import AdminStatCard from "../../components/AdminStatCard";
import AdminChart from "../../components/AdminChart";
import { FileText, BarChart2, Users } from "lucide-react";
import { getDashboardData, GroupBy } from "../../api/dashboard.api";
import { formatCurrency } from "../../utils/formatters";

export default function AdminPage() {
  // trạng thái thống kê theo ngày / tháng / năm
  const [groupBy, setGroupBy] = useState<GroupBy>("month");

  // dữ liệu dashboard lấy từ BE
  const [dashboard, setDashboard] = useState<any>(null);

  // gọi API mỗi khi groupBy thay đổi
  useEffect(() => {
    getDashboardData(groupBy).then(setDashboard);
  }, [groupBy]);

  // loading lần đầu
  if (!dashboard) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* ===== THỐNG KÊ ===== */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AdminStatCard
          title="Tổng lượt check-in hôm nay"
          value={dashboard.totalCheckInsToday}
          icon={FileText}
        />

        <AdminStatCard
          title="Doanh thu ngày hôm nay"
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

      {/* ===== BIỂU ĐỒ ===== */}
      <AdminChart
        data={dashboard.serviceUsageChart}
        groupBy={groupBy}
        onChangeGroupBy={setGroupBy}
      />
    </div>
  );
}
