
import type { Palette } from '../types';

// This interface defines the shape of the image data object
// that the service function expects.
interface ApiImageData {
  base64Data: string;
  mimeType: string;
}

/**
 * Handles the response from our API endpoint, parsing JSON and throwing errors.
 * @param response The fetch Response object.
 * @returns The parsed JSON data.
 */
async function handleApiResponse(response: Response): Promise<any> {
  if (!response.ok) {
    // If the server returned an error, try to parse the error message from the JSON body.
    try {
      const errorData = await response.json();
      // Use the specific error message from the backend, or a default one.
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    } catch (e) {
      // If parsing the error response fails, throw a generic network error.
      throw new Error(`Request failed with status ${response.status}`);
    }
  }
  // If the response is successful, parse and return the JSON body.
  return response.json();
}

/**
 * Fetches theme suggestions from our backend API based on a hex color.
 * @param baseColor The hex color string (e.g., '#87CEEB').
 * @returns A promise that resolves to an array of color palettes.
 */
export async function getThemeSuggestions(baseColor: string): Promise<Palette[]> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: 'color', color: baseColor }),
  });

  return handleApiResponse(response);
}

/**
 * Fetches theme suggestions from our backend API based on an uploaded image.
 * @param image An object containing the base64 encoded image data and its MIME type.
 * @returns A promise that resolves to an array of color palettes.
 */
export async function getThemeSuggestionsFromImage(image: ApiImageData): Promise<Palette[]> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: 'image', image: image }),
  });

  return handleApiResponse(response);
}
