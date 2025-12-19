import { FilterCondition } from '../components/filter/FilterModal';

export const transformFilters = (filters: FilterCondition[]) => {
  const mergedFilters = new Map<string, any>();

  filters.forEach((f) => {
    const uniqueKey = `${f.fieldKey}-${f.operator}`;

    if (mergedFilters.has(uniqueKey)) {
      // Logic gộp nếu đã tồn tại key (giữ nguyên như trước)
      const existing = mergedFilters.get(uniqueKey);
      if (Array.isArray(existing.value) && Array.isArray(f.values)) {
        existing.value = Array.from(new Set([...existing.value, ...f.values]));
      }
    } else {
      // Logic xử lý value
      const hasValues = f.values && f.values.length > 0;
      let finalValue = hasValues ? f.values : f.value;

      // Ép kiểu số cho Status hoặc RoleId nếu cần (Backend bạn đang nhận ID là số)
      if ((f.fieldKey === 'status' || f.fieldKey === 'roleId') && !hasValues) {
          finalValue = Number(f.value);
      }

      let newFilterPayload = {
        field: f.fieldKey,
        operator: f.operator,
        value: finalValue,
      };

      // Nếu là mảng TagInput -> ép operator về 'in' hoặc 'contains'
      if (hasValues && f.operator !== 'contains') {
         newFilterPayload.operator = 'in'; 
      }
      
      // Xử lý Range (cho Ngày tạo)
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