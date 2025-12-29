import React from "react";
import { StatCard } from "@/components/common/StatCard";
import { statsMock } from "./dashboard.mock";


export const DashboardStats: React.FC = () => {
return (
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
{statsMock.map((item, index) => (
<StatCard key={index} title={item.title} value={item.value} />
))}
</div>
);
};