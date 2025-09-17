import { GoogleGenAI, Type } from "@google/genai";
import type { Palette } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface ApiImageData {
  base64Data: string;
  mimeType: string;
}

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: "Un nombre creativo y descriptivo para la paleta de colores en español (ej. 'Amanecer Costero', 'Sofisticación Urbana', 'Retiro Terrenal')."
      },
      description: {
        type: Type.STRING,
        description: "Una breve descripción en español, de una oración, sobre el ambiente o estilo que evoca esta paleta."
      },
      colors: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            hex: {
              type: Type.STRING,
              description: "El código de color hexadecimal, comenzando con '#'."
            },
            name: {
              type: Type.STRING,
              description: "Un nombre simple y común para el color en español (ej. 'Azul Cielo Claro', 'Gris Carbón')."
            }
          }
        }
      }
    }
  }
};

export async function getThemeSuggestions(baseColor: string): Promise<Palette[]> {
  const prompt = `
    Actúa como un diseñador de interiores experto especializado en paletas de colores de pintura para paredes de la marca SAYER.
    El usuario ha seleccionado un color principal para la pared: ${baseColor}.

    Tu tarea es generar exactamente TRES paletas de colores distintas y estéticamente agradables que complementen este color base. Cada paleta debe representar un estado de ánimo o estilo diferente. Para cada paleta, proporciona un nombre creativo, una breve descripción y una lista de 2 a 4 colores complementarios.

    El primer color en la lista de colores de cada paleta SIEMPRE debe ser el color base del usuario: ${baseColor}.
    Los colores siguientes deben ser colores de acento o complementarios.

    IMPORTANTE: Toda la salida, incluyendo los nombres de las paletas, las descripciones y los nombres de los colores, DEBE ESTAR EN ESPAÑOL.

    Sigue el esquema JSON con precisión.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("The API returned an empty response. The color might be invalid or there was a temporary issue.");
    }

    const palettes = JSON.parse(jsonText) as Palette[];
    
    if (!Array.isArray(palettes)) {
      throw new Error("AI response was not in the expected format (array of palettes).");
    }

    return palettes;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error("Failed to parse the AI's response. Please try a different color.");
    }
    throw new Error("Could not generate color palettes. The AI service may be temporarily unavailable.");
  }
}

export async function getThemeSuggestionsFromImage(image: ApiImageData): Promise<Palette[]> {
  const prompt = `
    Actúa como un diseñador de interiores experto especializado en paletas de colores de pintura para paredes de la marca SAYER.
    El usuario ha subido una imagen de un espacio o un objeto como inspiración.

    Tu tarea es analizar la imagen y generar exactamente TRES paletas de colores distintas y estéticamente agradables inspiradas en el contenido y el ambiente de la imagen.
    Para cada paleta, proporciona un nombre creativo, una breve descripción y una lista de 2 a 4 colores complementarios identificados o inspirados en la imagen.

    - Identifica los colores dominantes y de acento en la imagen.
    - Crea paletas que funcionarían bien para pintar paredes interiores.
    - Los colores de la paleta deben ser complementarios entre sí y reflejar el estilo de la imagen (ej. moderno, rústico, vibrante).

    IMPORTANTE: Toda la salida, incluyendo los nombres de las paletas, las descripciones y los nombres de los colores, DEBE ESTAR EN ESPAÑOL.

    Sigue el esquema JSON con precisión.
  `;

  const imagePart = {
    inlineData: {
      data: image.base64Data,
      mimeType: image.mimeType,
    },
  };

  const textPart = {
    text: prompt,
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("The API returned an empty response. The image might not be clear or there was a temporary issue.");
    }

    const palettes = JSON.parse(jsonText) as Palette[];
    
    if (!Array.isArray(palettes)) {
      throw new Error("AI response was not in the expected format (array of palettes).");
    }

    return palettes;
  } catch (error) {
    console.error("Error calling Gemini API with image:", error);
    if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error("Failed to parse the AI's response. Please try a different image.");
    }
    throw new Error("Could not generate color palettes from the image. The AI service may be temporarily unavailable.");
  }
}