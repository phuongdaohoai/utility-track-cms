import React, { useState, useRef, useEffect } from 'react';

interface TagInputProps {
  value: string[];
  suggestions?: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({
  value,
  suggestions = [],
  onChange,
  placeholder = 'Nhập và nhấn Enter...',
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ---- Helpers ----
  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) return;

    onChange([...value, trimmed]);
    setInputValue('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  // ---- Keyboard handling ----
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    }

    if (e.key === 'Backspace' && !inputValue && value.length) {
      removeTag(value[value.length - 1]);
    }
  };

  // ---- Filter suggestions ----
  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(s)
  );

  // ---- Click outside ----
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input wrapper */}
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
                onClick={() => removeTag(tag)}
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
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none border-none bg-transparent text-sm"
        />
      </div>

      {/* Suggestions */}
      {isOpen && filteredSuggestions.length > 0 && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.map((item) => (
            <div
              key={item}
              onClick={() => addTag(item)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
