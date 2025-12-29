import React from "react";


interface StatCardProps {
title: string;
value: string | number;
}
export const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
return (
<div className="rounded-2xl bg-white shadow-sm">
<div className="p-5">
<p className="text-sm text-gray-500 mb-2">{title}</p>
<p className="text-2xl font-semibold text-blue-600">{value}</p>
</div>
</div>
);
};