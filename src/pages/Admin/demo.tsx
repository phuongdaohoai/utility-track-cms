import { useState } from "react";
import FilterModal from "../../components/filters/FilterModal";

export default function TagField() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-gray-200 px-4 py-2 rounded">
        Mở bộ lọc
      </button>

      {open && (
        <FilterModal
          onApply={(filters) => {
            console.log("SEND TO BE:", filters);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}
