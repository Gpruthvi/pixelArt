import React, { useState, useCallback } from 'react';
import { Download, Grid, Hash } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { PixelGrid } from './components/PixelGrid';
import { processImage } from './utils/imageProcessing';
import { PixelData, PixelArtConfig } from './types';
import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';

function App() {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [pixelData, setPixelData] = useState<PixelData | null>(null);
  const [showNumbers, setShowNumbers] = useState(true);
  const [config, setConfig] = useState<PixelArtConfig>({
    gridSize: 10,
    maxColors: 12
  });

  const handleImageUpload = useCallback(async (file: File) => {
    setOriginalImage(file);
    const data = await processImage(file, config);
    setPixelData(data);
  }, [config]);

  const handleConfigChange = useCallback(async (newConfig: Partial<PixelArtConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    if (originalImage) {
      const data = await processImage(originalImage, updatedConfig);
      setPixelData(data);
    }
  }, [originalImage, config]);

  const handleDownload = async (format: 'png' | 'svg' | 'pdf') => {
    const element = document.querySelector('.pixel-grid');
    if (!element) return;

    try {
      switch (format) {
        case 'png':
          const pngData = await toPng(element);
          downloadFile(pngData, 'pixel-art.png');
          break;
        case 'svg':
          const svgData = await toSvg(element);
          downloadFile(svgData, 'pixel-art.svg');
          break;
        case 'pdf':
          const pdfData = await toPng(element);
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [800, 800]
          });
          pdf.addImage(pdfData, 'PNG', 0, 0, 800, 800);
          pdf.save('pixel-art.pdf');
          break;
      }
    } catch (error) {
      console.error('Error downloading:', error);
    }
  };

  const downloadFile = (data: string, filename: string) => {
    const link = document.createElement('a');
    link.href = data;
    link.download = filename;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Pixel Art Generator</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grid Size
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={config.gridSize}
                  onChange={(e) => handleConfigChange({
                    gridSize: parseInt(e.target.value)
                  })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 w-16">{config.gridSize}px</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Colors
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="2"
                  max="24"
                  value={config.maxColors}
                  onChange={(e) => handleConfigChange({
                    maxColors: parseInt(e.target.value)
                  })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 w-16">{config.maxColors}</span>
              </div>
            </div>
          </div>
        </div>

        {!originalImage ? (
          <ImageUploader onImageUpload={handleImageUpload} />
        ) : (
          <div className="space-y-8">
            <div className="flex gap-4">
              <button
                onClick={() => setShowNumbers(!showNumbers)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
              >
                {showNumbers ? <Hash /> : <Grid />}
                {showNumbers ? 'Hide Numbers' : 'Show Numbers'}
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload('png')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                >
                  <Download size={20} />
                  PNG
                </button>
                <button
                  onClick={() => handleDownload('svg')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
                >
                  <Download size={20} />
                  SVG
                </button>
                <button
                  onClick={() => handleDownload('pdf')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
                >
                  <Download size={20} />
                  PDF
                </button>
              </div>
            </div>

            {pixelData && (
              <>
                <div className="pixel-grid">
                  <PixelGrid pixelData={pixelData} showNumbers={showNumbers} />
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Color Guide</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {pixelData.colors.map((color, index) => (
                      <div key={color.hex} className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>#{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;