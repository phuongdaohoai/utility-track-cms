import { useState, useRef, useEffect } from "react";

/* ===================== TYPES ===================== */

export type Value = "day" | "month" | "year";

interface Props {
  value: Value;
  onChange: (v: Value) => void;
}

/* ===================== OPTIONS (FIX Ở ĐÂY) ===================== */
/* 👇 BẮT BUỘC GẮN TYPE */
const options: { label: string; value: Value }[] = [
  { label: "Năm", value: "year" },
  { label: "Tháng", value: "month" },
  { label: "Ngày", value: "day" },
];

/* ===================== COMPONENT ===================== */

export default function GroupBySelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative w-[120px] text-sm">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="
          flex w-full items-center justify-between
          rounded-md
          border border-gray-300
          bg-white
          px-3 py-2
          text-gray-700
          hover:border-gray-400
        "
      >
        <span>{current?.label}</span>

        {/* Chevron icon */}
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute z-50 mt-1 w-full
            rounded-md
            border border-gray-200
            bg-white
            shadow-sm
          "
        >
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value); // ✅ KHÔNG CÒN LỖI
                setOpen(false);
              }}
              className="
                cursor-pointer
                px-3 py-2
                text-gray-700
                hover:text-blue-600
              "
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
