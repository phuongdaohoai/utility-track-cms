import { FilterCondition } from '../components/fill/FilterModal';

export const transformFilters = (filters: FilterCondition[]) => {
  const mergedFilters = new Map<string, any>();

  filters.forEach((f) => {
    const uniqueKey = `${f.fieldKey}-${f.operator}`;

    if (mergedFilters.has(uniqueKey)) {
      const existing = mergedFilters.get(uniqueKey);
      if (Array.isArray(existing.value) && Array.isArray(f.values)) {
        existing.value = Array.from(new Set([...existing.value, ...f.values]));
      }
    } else {
      // --- SỬA ĐOẠN NÀY ---
      // Chỉ lấy values (mảng) nếu nó có dữ liệu. Nếu không thì lấy value (đơn).
      const hasValues = f.values && f.values.length > 0;
      
      let finalValue = hasValues ? f.values : f.value;

      // Logic ép kiểu cho Status (nếu cần số thay vì chuỗi)
      if (f.fieldKey === 'status' && !hasValues) {
          finalValue = Number(f.value);
      }
      // --------------------

      let newFilterPayload = {
        field: f.fieldKey,
        operator: f.operator,
        value: finalValue,
      };

      // Nếu là mảng (TagInput) -> chuyển operator thành 'in' hoặc 'contains'
      if (hasValues) {
         if (f.operator !== 'contains') {
             newFilterPayload.operator = 'in'; 
         }
      }
      
      // Xử lý Range
      if (f.operator === 'range') {
          newFilterPayload = {
              ...newFilterPayload,
              from: f.value,
              to: f.value2
          };
          delete newFilterPayload.value;
      }

      mergedFilters.set(uniqueKey, newFilterPayload);
    }
  });

  return Array.from(mergedFilters.values());
};