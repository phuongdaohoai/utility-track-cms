import React, { useState, useRef, useEffect } from 'react';

export interface TagInputProps {
  value: string[];
  suggestions?: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  onInputChange?: (value: string) => void;
}

export const TagInput: React.FC<TagInputProps> = ({
  value,
  suggestions = [],
  onChange,
  placeholder = 'Nhập và nhấn Enter...',
  disabled = false,
  onInputChange,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(s)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);
    setSelectedIndex(-1);

    if (onInputChange) {
      onInputChange(val);
    }
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) return;

    onChange([...value, trimmed]);
    setInputValue('');
    setIsOpen(false);
    setSelectedIndex(-1);

    if (onInputChange) onInputChange('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isOpen && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredSuggestions.length);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev <= 0 ? filteredSuggestions.length - 1 : prev - 1
        );
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();

      if (isOpen && selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
        addTag(filteredSuggestions[selectedIndex]);
      } else {
        addTag(inputValue);
      }
    }

    if (e.key === 'Backspace' && !inputValue && value.length) {
      removeTag(value[value.length - 1]);
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={`flex flex-wrap items-center gap-1 border rounded-md px-2 py-1.5 bg-white text-sm
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'focus-within:border-indigo-500'}
        `}
        onClick={() => !disabled && setIsOpen(true)}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="hover:text-indigo-900"
              >
                ×
              </button>
            )}
          </span>
        ))}

        <input
          type="text"
          value={inputValue}
          disabled={disabled}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none border-none bg-transparent text-sm"
        />
      </div>

      {isOpen && filteredSuggestions.length > 0 && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredSuggestions.map((item, index) => (
            <div
              key={item}
              onClick={() => addTag(item)}
              className={`px-3 py-2 text-sm cursor-pointer ${
                index === selectedIndex
                  ? 'bg-indigo-100 text-indigo-900'
                  : 'hover:bg-indigo-50 text-gray-700'
              }`}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
