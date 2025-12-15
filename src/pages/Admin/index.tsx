import AdminStatCard from "../../components/AdminStatCard";
import AdminChart from "../../components/AdminChart";

import { FileText, BarChart2, Users } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Thống kê */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AdminStatCard
          title="Tổng lượt check-in hôm nay"
          value="142"
          icon={FileText}
        />
        <AdminStatCard
          title="Doanh thu ngày hôm nay"
          value="2.000.000"
          icon={BarChart2}
          highlight
        />
        <AdminStatCard
          title="Cư dân đang sử dụng dịch vụ"
          value="5"
          icon={Users}
        />
      </div>

      {/* Biểu đồ */}
      <AdminChart />
    </div>
  );
}
