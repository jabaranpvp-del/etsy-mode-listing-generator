import React, { useState, useRef } from 'react';
import { analyzeEtsyImage } from './services/geminiService';
import { EtsyListingData, AppStatus } from './types';
import { Button } from './components/Button';

/* ---------- IMAGE RESIZE (FIX 413 ERROR) ---------- */
async function resizeImageToDataUrl(
  file: File,
  maxSize = 1024,
  quality = 0.82
): Promise<string> {
  const img = document.createElement('img');
  img.src = URL.createObjectURL(file);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Image load failed'));
  });

  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg', quality);
}
/* ------------------------------------------------- */

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [result, setResult] = useState<EtsyListingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------- UPDATED PROCESS FILE ---------- */
  const processFile = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }

    try {
      const resizedImage = await resizeImageToDataUrl(file);
      setImage(resizedImage);
      setResult(null);
      setError(null);
      setStatus('idle');
    } catch (e) {
      console.error(e);
      setError('Failed to process image.');
    }
  };
  /* ------------------------------------------ */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleGenerate = async () => {
    if (!image) return;
    setStatus('analyzing');
    setError(null);
console.log('🟢 Generate clicked');


    try {
      const data = await analyzeEtsyImage(image);
      setResult(data);
      setStatus('completed');
    } catch (err) {
      console.error(err);
      setError('Analysis failed. Please try again.');
      setStatus('error');
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setStatus('idle');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col items-center pb-20 px-4 md:px-0">
      <header className="w-full max-w-4xl py-12 text-center">
        <h1 className="serif text-5xl md:text-6xl mb-4 text-[#F1641E]">Etsy Mode</h1>
        <p className="text-gray-500 text-lg uppercase tracking-widest font-medium">
          Digital Download Listing Optimizer
        </p>
      </header>

      <main className="w-full max-w-4xl">
        {!image && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full aspect-[4/3] max-h-[500px] border-4 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all group ${
              isDragging
                ? 'border-[#F1641E] bg-orange-50'
                : 'border-gray-200 hover:border-[#F1641E] hover:bg-orange-50'
            }`}
          >
            <p className="text-xl font-semibold text-gray-700">
              Click to upload or drag image here
            </p>
            <p className="text-gray-400 mt-2">Supports JPG, PNG, WEBP</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>
        )}

        {image && status !== 'completed' && (
          <div className="flex flex-col items-center gap-6">
            <img
              src={image}
              alt="Preview"
              className="w-full max-w-md rounded-xl shadow-lg"
            />

            <Button onClick={handleGenerate} loading={status === 'analyzing'} className="w-64">
              {status === 'analyzing' ? 'Researching Trends...' : 'Generate SEO Listing'}
            </Button>

            {error && <p className="text-red-500 font-medium">{error}</p>}
          </div>
        )}

        {result && status === 'completed' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">SEO Optimized Listing</h2>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
            <Button variant="outline" onClick={reset}>
              Upload Another
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
