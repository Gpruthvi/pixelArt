import { PixelData, PixelArtConfig } from '../types';

export async function processImage(
  imageFile: File,
  config: PixelArtConfig
): Promise<PixelData> {
  const img = await createImageBitmap(imageFile);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Scale image to fit within max dimensions while maintaining aspect ratio
  const maxDim = 800;
  let width = img.width;
  let height = img.height;
  
  if (width > height && width > maxDim) {
    height = (height * maxDim) / width;
    width = maxDim;
  } else if (height > maxDim) {
    width = (width * maxDim) / height;
    height = maxDim;
  }

  // Adjust dimensions to match grid size
  width = Math.floor(width / config.gridSize) * config.gridSize;
  height = Math.floor(height / config.gridSize) * config.gridSize;
  
  canvas.width = width;
  canvas.height = height;
  
  // Draw and get pixel data
  ctx.drawImage(img, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  
  // Process pixels and quantize colors
  const { colors, grid } = quantizeColors(imageData, config);
  
  return { colors, grid };
}

function quantizeColors(
  imageData: ImageData,
  config: PixelArtConfig
): PixelData {
  // Simplified color quantization - in reality, you'd want to use a more sophisticated algorithm
  const colorMap = new Map<string, number>();
  const pixels = [];
  
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    
    // Reduce color space
    const quantizedR = Math.round(r / 32) * 32;
    const quantizedG = Math.round(g / 32) * 32;
    const quantizedB = Math.round(b / 32) * 32;
    
    const hex = `#${quantizedR.toString(16).padStart(2, '0')}${quantizedG.toString(16).padStart(2, '0')}${quantizedB.toString(16).padStart(2, '0')}`;
    
    if (!colorMap.has(hex)) {
      colorMap.set(hex, colorMap.size);
    }
    
    pixels.push(colorMap.get(hex)!);
  }
  
  // Create color palette
  const colors = Array.from(colorMap.entries()).map(([hex], index) => ({
    hex,
    number: index + 1
  }));
  
  // Create grid
  const gridWidth = imageData.width / config.gridSize;
  const gridHeight = imageData.height / config.gridSize;
  const grid: number[][] = Array(gridHeight).fill(0).map(() => Array(gridWidth).fill(0));
  
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const pixelIndex = (y * config.gridSize * imageData.width + x * config.gridSize) * 4;
      grid[y][x] = pixels[pixelIndex / 4];
    }
  }
  
  return { colors, grid };
}