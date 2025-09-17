
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 bg-white rounded-xl shadow-md border border-gray-200">
      <img 
        src="https://res.cloudinary.com/dsmzpsool/image/upload/v1758071367/Gemini_Generated_Image_z3hoc0z3hoc0z3ho-removebg-preview_udirhn.png"
        alt="Asistente de IA de Sayer pensando"
        className="h-32 w-32 mb-4 animate-pulse"
      />
      <h3 className="text-lg font-semibold text-gray-800">Tu asistente está buscando la inspiración...</h3>
      <p className="text-gray-500 mt-1">Creando las mejores combinaciones para tu espacio.</p>
    </div>
  );
};
