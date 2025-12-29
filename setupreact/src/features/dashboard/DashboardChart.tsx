import React from "react";
import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
Legend,
ResponsiveContainer,
} from "recharts";
import { chartMock } from "./dashboard.mock";


export const DashboardChart: React.FC = () => {
return (
<div className="rounded-2xl bg-white shadow-sm">
<div className="p-6">
<div className="flex items-center justify-between mb-4">
<h3 className="font-medium">Biểu đồ</h3>
<select className="border rounded-md px-3 py-1 text-sm">
<option>Năm</option>
<option>Tháng</option>
<option>Ngày</option>
</select>
</div>


<div className="h-[320px]">
<ResponsiveContainer width="100%" height="100%">
<BarChart data={chartMock} barCategoryGap={18}>
<XAxis dataKey="name" stroke="#94a3b8" />
<YAxis stroke="#94a3b8" />
<Tooltip />
<Legend />
<Bar dataKey="all" name="Tất cả" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
<Bar dataKey="pool" name="Bơi" fill="#2563eb" radius={[4, 4, 0, 0]} />
<Bar dataKey="gym" name="Gym" fill="#ef4444" radius={[4, 4, 0, 0]} />
</BarChart>
</ResponsiveContainer>
</div>
</div>
</div>
);
};