import React, { useState, useEffect } from 'react';
import { ColorInput } from './components/ColorInput';
import { ImageUploader } from './components/ImageUploader';
import { PaletteDisplay } from './components/PaletteDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { WelcomeSplash } from './components/WelcomeSplash';
import { Header } from './components/Header';
import { StatusIndicator } from './components/StatusIndicator';
import { getThemeSuggestions, getThemeSuggestionsFromImage } from './services/geminiService';
import type { Palette, ImageData } from './types';
import type { ApiStatus } from './components/StatusIndicator';

type InputMode = 'color' | 'image';

function App() {
  const [activeInput, setActiveInput] = useState<InputMode>('color');
  const [color, setColor] = useState<string>('#87CEEB'); // Default to sky blue
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [palettes, setPalettes] = useState<Palette[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    if (apiStatus === 'success') {
      const timer = setTimeout(() => {
        setApiStatus('idle');
        setStatusMessage('');
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [apiStatus]);

  const handleGenerate = async () => {
    // Reset state before new request
    setIsLoading(true);
    setError(null);
    setPalettes(null);
    setApiStatus('loading');
    setStatusMessage('Comunicando con el asistente de IA para generar las paletas...');

    try {
      let result: Palette[];
      if (activeInput === 'color') {
        if (!/^#[0-9A-F]{6}$/i.test(color)) {
          throw new Error('Por favor, introduce un código de color hexadecimal válido (ej. #87CEEB).');
        }
        result = await getThemeSuggestions(color);
      } else {
        if (!imageData) {
          throw new Error('Por favor, sube una imagen para generar paletas.');
        }
        result = await getThemeSuggestionsFromImage({
          base64Data: imageData.base64Data,
          mimeType: imageData.mimeType,
        });
      }
      setPalettes(result);
      setApiStatus('success');
      setStatusMessage('¡Paletas generadas con éxito!');
    } catch (e: any) {
      const errorMessage = e.message || 'Ocurrió un error inesperado.';
      setError(errorMessage);
      setApiStatus('error');
      setStatusMessage(`Falló la comunicación con el servidor. Revisa el detalle abajo.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCloseStatus = () => {
    setApiStatus('idle');
    setStatusMessage('');
  };

  const isGenerateDisabled = isLoading || (activeInput === 'color' && !color) || (activeInput === 'image' && !imageData);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return <ErrorMessage message={error} />;
    }
    if (palettes) {
      return <PaletteDisplay palettes={palettes} />;
    }
    return <WelcomeSplash />;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">1. Elige tu inspiración</h2>
          {/* Input Mode Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <TabButton
              label="Por Color"
              isActive={activeInput === 'color'}
              onClick={() => setActiveInput('color')}
              disabled={isLoading}
            />
            <TabButton
              label="Por Imagen"
              isActive={activeInput === 'image'}
              onClick={() => setActiveInput('image')}
              disabled={isLoading}
            />
          </div>

          {/* Inputs */}
          <div className="mb-6">
            {activeInput === 'color' ? (
              <ColorInput
                color={color}
                onChange={setColor}
                disabled={isLoading}
              />
            ) : (
              <ImageUploader
                imageData={imageData}
                onImageUpload={setImageData}
                disabled={isLoading}
              />
            )}
          </div>

          <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">2. Genera las paletas</h2>

          {/* Action Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className={`
              w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg
              hover:bg-blue-700 transition-all duration-200
              focus:outline-none focus:ring-4 focus:ring-blue-300
              disabled:bg-blue-300 disabled:cursor-not-allowed
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            {isLoading ? 'Generando...' : 'Generar Ideas'}
          </button>
        </div>

        {/* Output Section */}
        <div className="mt-12">
           <h2 className="text-lg md:text-2xl font-semibold mb-4 text-gray-800 text-center">3. ¡Inspírate!</h2>
            {apiStatus !== 'idle' && (
              <div className="mb-8">
                <StatusIndicator status={apiStatus} message={statusMessage} onClose={handleCloseStatus} />
              </div>
            )}
          {renderContent()}
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-gray-500 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <p>&copy; {new Date().getFullYear()} Sayer Color Assistant. Todos los derechos reservados.</p>
        <span className="bg-yellow-200 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            Versión de Prueba
        </span>
      </footer>
    </div>
  );
}


interface TabButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
    disabled: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`
            px-4 py-2 -mb-px font-semibold text-sm border-b-2
            transition-colors duration-200 focus:outline-none
            ${isActive
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
        `}
    >
        {label}
    </button>
);


export default App;