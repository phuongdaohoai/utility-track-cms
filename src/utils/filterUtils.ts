import { FilterCondition } from '../components/fill/FilterModal';

export const transformFilters = (filters: FilterCondition[]) => {
  const mergedFilters = new Map<string, any>();

  filters.forEach((f) => {
    const uniqueKey = `${f.fieldKey}-${f.operator}`;

    if (mergedFilters.has(uniqueKey)) {
      const existing = mergedFilters.get(uniqueKey);

      if (Array.isArray(existing.values) && Array.isArray(f.values)) {
        const combinedValues = Array.from(new Set([...existing.values, ...f.values]));
        existing.values = combinedValues;
      }
    } else {
      let newFilterPayload = {
        field: f.fieldKey,
        operator: f.operator,
        value: f.values || f.value,
        from: undefined,
        to: undefined
      };

      if (f.values && f.values.length > 0) {
       if (f.operator !== 'contains') {
             newFilterPayload.operator = 'in'; 
         }
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