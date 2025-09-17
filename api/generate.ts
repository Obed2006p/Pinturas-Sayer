import { GoogleGenAI, Type } from "@google/genai";
import type { Palette } from "../src/types";

// This tells Vercel to run this as an edge function for better performance
export const config = {
  runtime: 'edge',
};

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


async function generateFromColor(ai: GoogleGenAI, baseColor: string): Promise<Palette[]> {
  const prompt = `
    Actúa como un diseñador de interiores experto especializado en paletas de colores de pintura para paredes de la marca SAYER.
    El usuario ha seleccionado un color principal para la pared: ${baseColor}.

    Tu tarea es generar exactamente TRES paletas de colores distintas y estéticamente agradables que complementen este color base. Cada paleta debe representar un estado de ánimo o estilo diferente. Para cada paleta, proporciona un nombre creativo, una breve descripción y una lista de 2 a 4 colores complementarios.

    El primer color en la lista de colores de cada paleta SIEMPRE debe ser el color base del usuario: ${baseColor}.
    Los colores siguientes deben ser colores de acento o complementarios.

    IMPORTANTE: Toda la salida, incluyendo los nombres de las paletas, las descripciones y los nombres de los colores, DEBE ESTAR EN ESPAÑOL.

    Sigue el esquema JSON con precisión.
  `;

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
      throw new Error("La API devolvió una respuesta vacía.");
    }

    try {
        return JSON.parse(jsonText) as Palette[];
    } catch (e) {
        console.error("Failed to parse JSON from AI response. Raw text:", jsonText);
        throw new Error("La respuesta de la IA no tuvo el formato JSON esperado. Revisa los logs del servidor para ver la respuesta completa.");
    }
}

async function generateFromImage(ai: GoogleGenAI, image: { base64Data: string, mimeType: string }): Promise<Palette[]> {
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
      throw new Error("La API devolvió una respuesta vacía después de procesar la imagen.");
    }
    
    try {
        return JSON.parse(jsonText) as Palette[];
    } catch(e) {
        console.error("Failed to parse JSON from AI response (image). Raw text:", jsonText);
        throw new Error("La respuesta de la IA no tuvo el formato JSON esperado. Revisa los logs del servidor para ver la respuesta completa.");
    }
}


// Main handler for the serverless function
export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'La clave de API no está configurada en el servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const ai = new GoogleGenAI({ apiKey });

  try {
    const body = await request.json();
    const { type } = body;

    let palettes: Palette[];

    if (type === 'color') {
      const { color } = body;
      if (!color || typeof color !== 'string' || !/^#[0-9A-F]{6}$/i.test(color)) {
        return new Response(JSON.stringify({ error: 'Se requiere un código de color hexadecimal válido.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      palettes = await generateFromColor(ai, color);
    } else if (type === 'image') {
      const { image } = body;
      if (!image || !image.base64Data || !image.mimeType) {
         return new Response(JSON.stringify({ error: 'Se requieren los datos de la imagen.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      palettes = await generateFromImage(ai, image);
    } else {
      return new Response(JSON.stringify({ error: 'Se especificó un tipo de solicitud no válido.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    if (!Array.isArray(palettes)) {
      throw new Error("La respuesta de la IA no estaba en el formato esperado (array de paletas).");
    }

    return new Response(JSON.stringify(palettes), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in API route:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocurrió un error inesperado.";
    return new Response(JSON.stringify({ error: `Error del servidor: ${errorMessage}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}