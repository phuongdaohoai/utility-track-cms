import React, { useState, useEffect } from 'react';

// --- Định nghĩa các Type ---
import { TagInput } from './TagInput';
import { TAG_DATA } from './mockup.config';
export type FilterType = 'string' | 'number' | 'select' | 'date';

export interface FilterConfig {
  key: string;
  label: string;
  type: FilterType;
  options?: { label: string; value: any }[]; // Dùng cho loại Select
}

export interface FilterCondition {
  id: string;
  fieldKey: string;
  operator: string;
  values?: any[];
  value?: any;
  value2?: any;
}
interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterCondition[]) => void;
  availableFields: FilterConfig[];
  tagData?: Record<string, string[]>;
  onSearchChange?: (key: string, value: string) => void; // <--- THÊM DÒNG NÀY
}

// --- Cấu hình Operators ---

const OPERATORS: Record<FilterType, { value: string; label: string }[]> = {
  string: [
    { value: 'is', label: 'Is' },
    { value: 'contains', label: 'Contains' },
  ],
  number: [
    { value: 'is', label: 'Is' },
    { value: 'gt', label: '>' },
    { value: 'gte', label: '>=' },
    { value: 'lt', label: '<' },
    { value: 'lte', label: '<=' },
    { value: 'is_not', label: 'Is not' },
    { value: 'range', label: 'Range' },
  ],
  select: [
    { value: 'is', label: 'Is' },
    { value: 'is_not', label: 'Is not' },
  ],
  date: [
    { value: 'range', label: 'Range' },
    { value: 'is', label: 'Is' },
    { value: 'gt', label: '>' },
    { value: 'gte', label: '>=' },
    { value: 'lt', label: '<' },
    { value: 'lte', label: '<=' },
    { value: 'is_not', label: 'Is not' },
  ],
};

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply, availableFields, tagData = {}, onSearchChange }) => {
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Reset khi đóng mở
  useEffect(() => {
    if (isOpen) {
      // Có thể load filters cũ từ props nếu cần nhớ trạng thái
    }
  }, [isOpen]);

  const handleAddFilter = (fieldKey: string) => {
    const fieldConfig = availableFields.find((f) => f.key === fieldKey);
    if (!fieldConfig) return;

    const newFilter: FilterCondition = {
      id: crypto.randomUUID(),
      fieldKey,
      operator: OPERATORS[fieldConfig.type][0].value,
      values: [],
    };


    setFilters([...filters, newFilter]);
    setIsAdding(false);
  };

  const handleRemoveFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, key: keyof FilterCondition, val: any) => {
    setFilters((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          // Reset value nếu đổi operator sang/từ 'range' để tránh lỗi
          if (key === 'operator' && (val === 'range' || f.operator === 'range')) {
            return { ...f, [key]: val, value: '', value2: '' };
          }
          return { ...f, [key]: val };
        }
        return f;
      })
    );
  };

  const handleClearAll = () => setFilters([]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  // --- Render Input dựa trên Operator và Type ---
  const renderInput = (filter: FilterCondition, config: FilterConfig) => {
    const isRange = filter.operator === 'range';

    // 1. Xử lý Date
    if (config.type === 'date') {
      return (
        <div className="flex items-center gap-2 w-full">
          <input
            type="date"
            className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-indigo-500"
            value={filter.value}
            onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
          />
          {isRange && (
            <>
              <span className="text-gray-500">~</span>
              <input
                type="date"
                className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-indigo-500"
                value={filter.value2 || ''}
                onChange={(e) => updateFilter(filter.id, 'value2', e.target.value)}
              />
            </>
          )}
        </div>
      );
    }

    // 2. Xử lý Select
    if (config.type === 'select') {
      return (
        <select
          className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-indigo-500 bg-white"
          value={filter.value}
          onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
        >
          <option value="">-- Chọn --</option>
          {config.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (config.type === 'string') {
     
      const suggestions = tagData[config.key] || [];
      return (
        <TagInput
          value={filter.values || []}
          suggestions={suggestions}
          onChange={(tags) => updateFilter(filter.id, 'values', tags)}
          placeholder="Nhập hoặc chọn..."
          onInputChange={(val) => {
             if (onSearchChange) onSearchChange(config.key, val);
          }}
        />
      );
    }
    return (
      <div className="flex items-center gap-2 w-full">
        <input
          type="number"
          placeholder="Nhập giá trị..."
          className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-indigo-500"
          value={filter.value || ''}
          onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
        />
        {isRange && (
          <>
            <span className="text-gray-500">~</span>
            <input
              type="number"
              className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-indigo-500"
              value={filter.value2 || ''}
              onChange={(e) => updateFilter(filter.id, 'value2', e.target.value)}
            />
          </>
        )}
      </div>
    );

  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity" onClick={onClose} />

      {/* Side Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Bộ lọc nâng cao</h2>
          <button onClick={handleClearAll} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear all
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Search bar giả lập (optional) */}
          <div className="mb-4 relative">
            <input className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm" placeholder="Tìm kiếm nhanh..." />
            <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
          </div>

          <div className="space-y-3">
            {filters.map((filter) => {
              const config = availableFields.find((f) => f.key === filter.fieldKey);
              if (!config) return null;

              return (
                <div key={filter.id} className="flex items-start gap-2 bg-white p-3 rounded-md shadow-sm border border-gray-200">
                  {/* Field Label (Readonly) */}
                  <div className="w-1/4 bg-gray-100 text-gray-700 text-sm font-medium py-1.5 px-3 rounded select-none truncate" title={config.label}>
                    {config.label}
                  </div>

                  {/* Operator Select */}
                  <div className="w-1/4">
                    <select
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 bg-white"
                      value={filter.operator}
                      onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                    >
                      {OPERATORS[config.type].map((op) => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Value Inputs */}
                  <div className="flex-1 min-w-0">
                    {renderInput(filter, config)}
                  </div>

                  {/* Delete Button */}
                  <button onClick={() => handleRemoveFilter(filter.id)} className="text-gray-400 hover:text-red-500 mt-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 000-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Filter Button */}
          <div className="mt-4">
            {!isAdding ? (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800 text-sm"
              >
                <span className="text-lg">+</span> Thêm bộ lọc
              </button>
            ) : (
              <select
                className="w-full border border-indigo-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-indigo-200"
                autoFocus
                onChange={(e) => {
                  if (e.target.value) handleAddFilter(e.target.value);
                }}
                onBlur={() => setIsAdding(false)}
                defaultValue=""
              >
                <option value="" disabled>Chọn trường lọc...</option>
                {availableFields// Ẩn các trường đã chọn (optional)
                  .map((f) => (
                    <option key={f.key} value={f.key}>{f.label}</option>
                  ))}
              </select>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-white flex justify-between items-center">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium">
            Đóng
          </button>
          <div className="flex gap-3">
            <button onClick={handleClearAll} className="text-indigo-600 hover:underline text-sm font-medium px-4">
              Reset all
            </button>
            <button onClick={handleApply} className="px-6 py-2 bg-indigo-700 text-white rounded-md hover:bg-indigo-800 text-sm font-medium shadow-sm">
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </>
  );
};