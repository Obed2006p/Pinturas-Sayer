
import React, { useState } from 'react';
import { Palette } from '../types';

interface PaletteDisplayProps {
  palettes: Palette[];
}

const ColorChip: React.FC<{ hex: string; name: string }> = ({ hex, name }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const textColor = getContrastColor(hex);

  return (
    <div
      className="relative flex-grow h-24 md:h-32 rounded-md flex flex-col items-center justify-center p-2 text-center transition-all duration-200 cursor-pointer group"
      style={{ backgroundColor: hex }}
      onClick={handleCopy}
    >
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center rounded-md">
        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm md:text-base font-semibold">
          {copied ? '¡Copiado!' : 'Copiar'}
        </span>
      </div>
      <span className="font-bold text-sm md:text-base" style={{ color: textColor }}>{name}</span>
      <span className="font-mono text-xs md:text-sm uppercase" style={{ color: textColor }}>{hex}</span>
    </div>
  );
};

// Simple utility to determine if text on a color chip should be light or dark
function getContrastColor(hex: string): string {
  if (!hex.startsWith('#')) return '#000000';
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
}


export const PaletteDisplay: React.FC<PaletteDisplayProps> = ({ palettes }) => {
  return (
    <div className="space-y-12">
      {palettes.map((palette, index) => (
        <div key={index} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{palette.name}</h3>
            <p className="text-sm md:text-base text-gray-600 mt-1">{palette.description}</p>
          </div>
          <div className="flex flex-row min-w-0">
            {palette.colors.map((color) => (
              <ColorChip key={color.hex} hex={color.hex} name={color.name} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
