import React from "react";
import { DashboardStats } from "./DashboardStats";
import { DashboardChart } from "./DashboardChart";


const DashboardPage: React.FC = () => {
return (
<div className="min-h-screen bg-gray-100 p-6">
<div className="max-w-7xl mx-auto space-y-6">
<DashboardStats />
<DashboardChart />
</div>
</div>
);
};


export default DashboardPage;