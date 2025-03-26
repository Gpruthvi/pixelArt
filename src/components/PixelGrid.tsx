import React from 'react';
import { PixelData } from '../types';

interface Props {
  pixelData: PixelData;
  showNumbers: boolean;
}

export function PixelGrid({ pixelData, showNumbers }: Props) {
  const { colors, grid } = pixelData;
  const cellSize = Math.floor(800 / grid[0].length);

  return (
    <div 
      className="border border-gray-200 bg-white"
      style={{ 
        display: 'grid',
        gridTemplateColumns: `repeat(${grid[0].length}, ${cellSize}px)`,
        width: 'fit-content'
      }}
    >
      {grid.map((row, i) =>
        row.map((colorIndex, j) => (
          <div
            key={`${i}-${j}`}
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: colors[colorIndex]?.hex || '#fff',
              border: '1px solid #eee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: `${cellSize * 0.4}px`,
              color: showNumbers ? '#000' : 'transparent'
            }}
          >
            {colorIndex + 1}
          </div>
        ))
      )}
    </div>
  );
}