import Select from "react-select";
import { FilterItem } from "../../types";
import { FILTER_FIELDS } from "./filter.config";

type Props = {
  filter: FilterItem;
  onChange: (value: any) => void;
};

export default function FilterValueInput({ filter, onChange }: Props) {
  if (filter.type === "string") {
    return (
      <input
        className="border rounded px-2 py-1 w-full"
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (filter.type === "number") {
    if (filter.operator === "range") {
      return (
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="From"
            className="border rounded px-2 py-1 w-full"
            onChange={(e) => onChange({ ...filter.value, from: e.target.value })}
          />
          <input
            type="number"
            placeholder="To"
            className="border rounded px-2 py-1 w-full"
            onChange={(e) => onChange({ ...filter.value, to: e.target.value })}
          />
        </div>
      );
    }
    return (
      <input
        type="number"
        className="border rounded px-2 py-1 w-full"
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (filter.type === "select") {
    const options =
      FILTER_FIELDS.find((f) => f.field === filter.field)?.options || [];
    return (
      <Select
        isMulti
        options={options}
        onChange={(val) => onChange(val.map((v: any) => v.value))}
      />
    );
  }

  if (filter.type === "date") {
    if (filter.operator === "range") {
      return (
        <div className="flex gap-2">
          <input
            type="date"
            className="border rounded px-2 py-1 w-full"
            onChange={(e) => onChange({ ...filter.value, from: e.target.value })}
          />
          <input
            type="date"
            className="border rounded px-2 py-1 w-full"
            onChange={(e) => onChange({ ...filter.value, to: e.target.value })}
          />
        </div>
      );
    }
    return (
      <input
        type="date"
        className="border rounded px-2 py-1 w-full"
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return null;
}
