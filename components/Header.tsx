import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 max-w-4xl">
          <div className="py-4 sm:py-6">
              <a href="/" className="inline-flex items-center gap-2 sm:gap-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg">
                <img
                  src="https://res.cloudinary.com/dsmzpsool/image/upload/v1758070510/SAYER-removebg-preview_2_ybofjx.png"
                  alt="Sayer Logo"
                  className="h-12 w-auto sm:h-16"
                />
                <span className="text-xl sm:text-2xl font-semibold text-gray-800 tracking-tight hidden sm:inline">
                  Asistente de Color
                </span>
              </a>
          </div>
      </div>
    </header>
  );
};