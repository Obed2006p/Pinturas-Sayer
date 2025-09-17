import React from 'react';

interface ColorInputProps {
  color: string;
  onChange: (color: string) => void;
  disabled: boolean;
}

export const ColorInput: React.FC<ColorInputProps> = ({ color, onChange, disabled }) => {
  
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.trim();
    if (!value.startsWith('#')) {
      value = `#${value}`;
    }
    // Basic validation for hex length
    if (value.length <= 7) {
        onChange(value);
    }
  };

  return (
    <div 
        className={`
            flex items-center gap-4 w-full bg-gray-50 border-2 border-gray-300 rounded-lg px-4 py-2
            focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500
            transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-200' : 'hover:border-gray-400'}
        `}
    >
        <label htmlFor="color-picker-input" className="relative flex-shrink-0 w-8 h-8 cursor-pointer" aria-label="Open color picker">
            {/* Visual representation of the color */}
            <div
                className="w-full h-full rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color }}
            />
        </label>
        {/* The actual color input, visually hidden but linked to the label */}
        <input
            id="color-picker-input"
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="absolute w-0 h-0 opacity-0" // Hidden but accessible by label
            disabled={disabled}
        />
        <input
            type="text"
            value={color.toUpperCase()}
            onChange={handleHexChange}
            maxLength={7}
            className="w-full bg-transparent text-lg font-mono tracking-wider text-gray-800 border-none focus:outline-none focus:ring-0 p-0 disabled:cursor-not-allowed"
            placeholder="#RRGGBB"
            disabled={disabled}
            aria-label="Hex color code"
        />
    </div>
  );
};