import React from 'react';

const InfoCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-gray-100 p-6 rounded-lg text-center">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            {children}
        </div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
)

export const WelcomeSplash: React.FC = () => {
  return (
    <div className="text-center p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Bienvenido al Asistente de Color</h2>
      <p className="mt-2 text-base md:text-lg text-gray-700 max-w-2xl mx-auto">
        ¿No estás seguro de qué colores combinan? Estás en el lugar correcto. Nuestra inteligencia artificial te ayudará a descubrir paletas de colores armónicas y profesionales para tus espacios.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard title="1. Elige tu Inspiración" description="Selecciona un color o sube una foto de tu espacio.">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
        </InfoCard>
         <InfoCard title="2. Genera Ideas" description="Haz clic en el botón para que la IA cree combinaciones.">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        </InfoCard>
         <InfoCard title="3. Inspírate" description="Explora las paletas y encuentra tu estilo perfecto.">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </InfoCard>
      </div>
    </div>
  );
};