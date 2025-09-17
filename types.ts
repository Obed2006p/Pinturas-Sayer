export interface Color {
  hex: string;
  name: string;
}

export interface Palette {
  name: string;
  description: string;
  colors: Color[];
}

export interface ImageData {
  // Data URL for previewing in <img> tags
  previewUrl: string;
  // Raw base64 string for the API
  base64Data: string;
  // MIME type of the image
  mimeType: string;
}