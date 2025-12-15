import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  icon: LucideIcon;
  highlight?: boolean;
}

export default function AdminStatCard({
  title,
  value,
  icon: Icon,
  highlight,
}: Props) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-white p-5">
      {/* Icon box */}
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-lg
        ${highlight ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
      >
        <Icon size={22} />
      </div>

      {/* Text */}
      <div>
        <p
          className={`text-2xl font-semibold
          ${highlight ? "text-blue-600" : "text-gray-900"}`}
        >
          {value}
        </p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </div>
  );
}
