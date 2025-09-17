import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import type { ImageData } from '../types';

interface ImageUploaderProps {
  onImageUpload: (imageData: ImageData | null) => void;
  disabled: boolean;
  imageData: ImageData | null;
}

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, disabled, imageData }) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setError(null);

    if (fileRejections.length > 0) {
        const firstRejection = fileRejections[0];
        if (firstRejection.errors[0].code === 'file-too-large') {
            setError(`El archivo es muy grande. El tamaño máximo es de ${MAX_SIZE_MB}MB.`);
        } else {
            setError(firstRejection.errors[0].message);
        }
        onImageUpload(null);
        return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        // The result from reader is a data URL: "data:image/jpeg;base64,..."
        // We need to extract the base64 part and the mime type.
        const base64Data = dataUrl.split(',')[1];
        const mimeType = dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));

        onImageUpload({
          previewUrl: dataUrl,
          base64Data: base64Data,
          mimeType: mimeType,
        });
      };
      reader.onerror = () => {
        setError("Error al leer el archivo.");
        onImageUpload(null);
      }
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false,
    maxSize: MAX_SIZE_BYTES,
    disabled: disabled,
  });

  const handleClearImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the dropzone
    onImageUpload(null);
    setError(null);
  }

  return (
    <div className="w-full">
        <div
            {...getRootProps()}
            className={`
                relative p-4 w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center
                cursor-pointer transition-all duration-200
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
                ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}
                ${imageData ? 'border-solid' : ''}
            `}
        >
            <input {...getInputProps()} />
            {imageData ? (
                 <>
                    <img src={imageData.previewUrl} alt="Vista previa de la imagen" className="max-h-full max-w-full rounded-md object-contain" />
                    {!disabled && (
                        <button 
                            onClick={handleClearImage}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-100 transition-colors"
                            aria-label="Remove image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </>
            ) : (
                <div className="text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {isDragActive ?
                        <p className="mt-2 text-sm">Suelta la imagen aquí...</p> :
                        <p className="mt-2 text-sm">
                            Arrastra una imagen o <span className="font-semibold text-blue-600">haz clic</span> para seleccionar
                        </p>
                    }
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP hasta {MAX_SIZE_MB}MB</p>
                </div>
            )}
        </div>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
};