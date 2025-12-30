import type { StatItem, ChartItem } from "./dashboard.types";


export const statsMock: StatItem[] = [
{ title: "Tổng lượt check-in hôm nay", value: 142 },
{ title: "Doanh thu ngày hôm nay", value: "2.000.000" },
{ title: "Cư dân đang sử dụng dịch vụ", value: 5 },
];


export const chartMock: ChartItem[] = [
{ name: "Jan", all: 90, pool: 80, gym: 60 },
{ name: "Feb", all: 110, pool: 80, gym: 120 },
{ name: "Mar", all: 115, pool: 15, gym: 80 },
{ name: "Apr", all: 50, pool: 60, gym: 40 },
{ name: "May", all: 110, pool: 55, gym: 60 },
{ name: "Jun", all: 115, pool: 45, gym: 115 },
{ name: "Jul", all: 95, pool: 80, gym: 15 },
{ name: "Aug", all: 110, pool: 110, gym: 80 },
{ name: "Sep", all: 80, pool: 80, gym: 80 },
{ name: "Oct", all: 115, pool: 15, gym: 80 },
{ name: "Nov", all: 115, pool: 80, gym: 115 },
{ name: "Dec", all: 80, pool: 80, gym: 80 },
];