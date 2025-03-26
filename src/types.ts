export interface PixelArtConfig {
  gridSize: number;
  maxColors: number;
}

export interface Color {
  hex: string;
  number: number;
}

export interface PixelData {
  colors: Color[];
  grid: number[][];
}