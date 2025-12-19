import { FilterCondition } from '../components/filter/FilterModal';

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
      // Logic xử lý value
      const hasValues = f.values && f.values.length > 0;
      let finalValue = hasValues ? f.values : f.value;
      if ((f.fieldKey === 'status' || f.fieldKey === 'roleId') && !hasValues) {
          finalValue = Number(f.value);
      }

      let newFilterPayload: any = {
        field: f.fieldKey,
        operator: f.operator,
        value: finalValue,
      };

      
      if (hasValues && f.operator !== 'contains') {
         newFilterPayload.operator = 'in'; 
      }
      
     
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