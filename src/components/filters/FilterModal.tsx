import { useState } from "react";
import Select from "react-select";
import { FILTER_FIELDS } from "./filter.config";
import { FilterItem } from "../../types";
import CreatableSelect from "react-select/creatable";

export default function FilterModal({ onApply }: { onApply: (f: FilterItem[]) => void }) {
  const [filters, setFilters] = useState<FilterItem[]>([]);

  const addFilter = (field: any) => {
    setFilters([
      ...filters,
      {
        field: field.field,
        label: field.label,
        type: field.type,
        operator: field.operators[0],
        value: field.type === "select" || field.type === "tag" ? [] : "",

      },
    ]);
  };

  const updateFilter = (i: number, key: keyof FilterItem, value: any) => {
    const clone = [...filters];
    clone[i] = { ...clone[i], [key]: value };
    setFilters(clone);
  };

  const removeFilter = (i: number) =>
    setFilters(filters.filter((_, idx) => idx !== i));

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white w-[620px] rounded-xl p-4 space-y-4">
        <h2 className="text-lg font-semibold">Bộ lọc</h2>

        {filters.map((f, i) => {
          const config = FILTER_FIELDS.find(x => x.field === f.field)!;

          return (
            <div key={i} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex gap-2 items-center">
                <span className="bg-gray-200 px-2 py-1 rounded w-28 text-sm">
                  {f.label}
                </span>

                <select
                  value={f.operator}
                  onChange={e => updateFilter(i, "operator", e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  {config.operators.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>

                <button
                  onClick={() => removeFilter(i)}
                  className="ml-auto text-red-500"
                >
                  🗑
                </button>
              </div>

              {/* VALUE */}
              {renderValueInput(f, i, updateFilter)}
            </div>
          );
        })}

        {/* ADD FILTER */}
        <select
          className="border rounded px-2 py-1 w-full"
          onChange={e => {
            const f = FILTER_FIELDS.find(x => x.field === e.target.value);
            if (f) addFilter(f);
          }}
        >
          <option>+ Thêm bộ lọc</option>
          {FILTER_FIELDS.map(f => (
            <option key={f.field} value={f.field}>{f.label}</option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button className="border px-4 py-2 rounded">Đóng</button>
          <button
            onClick={() => onApply(filters)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= VALUE INPUT ================= */

function renderValueInput(
  f: FilterItem,
  index: number,
  update: any
) {

  // TAG (free text, multi)
if (f.type === "tag") {
    const options =
    FILTER_FIELDS.find(x => x.field === f.field)?.options || [];
  return (
    <CreatableSelect
      isMulti
      options={options}
      placeholder="Nhập tên rồi Enter"
      value={(Array.isArray(f.value) ? f.value : []).map((v: string) => ({
        label: v,
        value: v,
      }))}
      onChange={(selected) =>
        update(
          index,
          "value",
          (selected || []).map((item: any) => item.value)
        )
      }
      formatCreateLabel={(inputValue) => `Thêm "${inputValue}"`}
    />
  );
}
  
  // STRING
  if (f.type === "string") {
    return (
      <input
        className="border rounded px-2 py-1 w-full"
        placeholder="Nhập text"
        onChange={e => update(index, "value", e.target.value)}
      />
    );
  }

  // NUMBER
  if (f.type === "number") {
    if (f.operator === "range") {
      return (
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="From"
            className="border rounded px-2 py-1 w-full"
            onChange={e =>
              update(index, "value", { ...f.value, from: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="To"
            className="border rounded px-2 py-1 w-full"
            onChange={e =>
              update(index, "value", { ...f.value, to: e.target.value })
            }
          />
        </div>
      );
    }
    return (
      <input
        type="number"
        className="border rounded px-2 py-1 w-full"
        onChange={e => update(index, "value", e.target.value)}
      />
    );
  }

  // SELECT (TAG)
  if (f.type === "select") {
    const options =
      FILTER_FIELDS.find(x => x.field === f.field)?.options || [];

    return (
      <Select
        isMulti
        options={options}
        value={options.filter(o => f.value.includes(o.value))}
        onChange={(val: any) =>
          update(index, "value", val.map((v: any) => v.value))
        }
      />
    );
  }

  // DATE
  if (f.type === "date") {
    if (f.operator === "range") {
      return (
        <div className="flex gap-2">
          <input
            type="date"
            className="border rounded px-2 py-1 w-full"
            onChange={e =>
              update(index, "value", { ...f.value, from: e.target.value })
            }
          />
          <input
            type="date"
            className="border rounded px-2 py-1 w-full"
            onChange={e =>
              update(index, "value", { ...f.value, to: e.target.value })
            }
          />
        </div>
      );
    }
    return (
      <input
        type="date"
        className="border rounded px-2 py-1 w-full"
        onChange={e => update(index, "value", e.target.value)}
      />
    );
  }

  return null;
}
