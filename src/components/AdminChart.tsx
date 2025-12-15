import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

const data = [
    { name: "Jan", all: 100, swim: 80, gym: 60 },
    { name: "Feb", all: 120, swim: 75, gym: 115 },
    { name: "Mar", all: 110, swim: 10, gym: 80 },
    { name: "Apr", all: 50, swim: 60, gym: 20 },
    { name: "May", all: 105, swim: 55, gym: 60 },
    { name: "Jun", all: 110, swim: 40, gym: 115 },
    { name: "Jul", all: 95, swim: 75, gym: 10 },
    { name: "Aug", all: 100, swim: 110, gym: 80 },
    { name: "Sep", all: 80, swim: 80, gym: 75 },
    { name: "Oct", all: 115, swim: 10, gym: 80 },
    { name: "Nov", all: 120, swim: 80, gym: 115 },
    { name: "Dec", all: 90, swim: 80, gym: 80 },
];

export default function AdminChart() {
    return (
        <div className="rounded-xl border bg-white p-6">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Biểu đồ</h2>
                <select className="rounded-md border px-3 py-1 text-sm">
                    <option>Năm</option>
                    <option>Tháng</option>
                    <option>Ngày</option>
                </select>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={320}>
                <BarChart
                    data={data}
                    barSize={10}
                    barGap={3}
                    barCategoryGap={28}
                >

                    {/* ĐƯỜNG NÉT ĐỨT */}
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />

                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend verticalAlign="bottom" />

                    <Bar dataKey="swim" name="Bơi" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="gym" name="Gym" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="all" name="Tất cả" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
