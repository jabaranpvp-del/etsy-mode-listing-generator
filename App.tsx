
import React, { useState, useRef } from 'react';
import { analyzeEtsyImage } from './services/geminiService';
import { EtsyListingData, AppStatus } from './types';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [result, setResult] = useState<EtsyListingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
        setStatus('idle');
      };
      reader.readAsDataURL(file);
    } else {
      setError("Please upload a valid image file.");
    }
  };

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
    try {
      const data = await analyzeEtsyImage(image);
      setResult(data);
      setStatus('completed');
    } catch (err: any) {
      console.error(err);
      setError("Analysis failed. Please try again with a clear image.");
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
      {/* Header */}
      <header className="w-full max-w-4xl py-12 text-center">
        <h1 className="serif text-5xl md:text-6xl mb-4 text-[#F1641E]">Etsy Mode</h1>
        <p className="text-gray-500 text-lg uppercase tracking-widest font-medium">Digital Download Listing Optimizer</p>
      </header>

      <main className="w-full max-w-4xl">
        {/* Upload Section */}
        {!image && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full aspect-[4/3] max-h-[500px] border-4 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all group ${
              isDragging ? 'border-[#F1641E] bg-orange-50' : 'border-gray-200 hover:border-[#F1641E] hover:bg-orange-50'
            }`}
          >
            <div className={`bg-white p-6 rounded-full shadow-sm mb-6 transition-transform ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
              <svg className="w-12 h-12 text-[#F1641E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-700">Click to upload or drag image here</p>
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

        {/* Action Bar */}
        {image && status !== 'completed' && (
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl bg-white border-8 border-white">
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={reset}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black text-white p-2 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex gap-4">
               <Button onClick={handleGenerate} loading={status === 'analyzing'} className="w-64">
                {status === 'analyzing' ? 'Researching Trends...' : 'Generate SEO Listing'}
              </Button>
            </div>

            {error && <p className="text-red-500 font-medium">{error}</p>}
          </div>
        )}

        {/* Results Section */}
        {result && status === 'completed' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end border-b pb-4">
               <h2 className="serif text-3xl text-gray-800">SEO Optimized Listing</h2>
               <Button variant="outline" onClick={reset} className="px-4 py-2">Upload Another</Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <CopyField label="Optimized Title (Trend-Based)" content={result.title} />
              <CopyField label="Description" content={result.description} multiline />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CopyField label="1st Main Color" content={result.firstMainColor} />
                <CopyField label="2nd Main Color" content={result.secondMainColor} />
                <CopyField label="Home Style" content={result.homeStyle} />
                <CopyField label="Celebration" content={result.celebration || "N/A"} />
                <CopyField label="Occasion" content={result.occasion} />
                <CopyField label="Subject" content={result.subject} />
              </div>

              <CopyField label="Room (Top 5)" content={result.room} />
              <CopyField label="High-Volume Tags (13)" content={result.tags} />

              {/* Research Sources Section */}
              {result.sources && result.sources.length > 0 && (
                <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                  <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-4">Research Sources & Trend Data</h3>
                  <div className="flex flex-wrap gap-3">
                    {result.sources.map((source, i) => (
                      <a 
                        key={i} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white border border-orange-200 px-3 py-2 rounded-lg text-xs text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 flex justify-center z-10">
        <p className="text-xs text-gray-400 font-medium tracking-widest uppercase">AI-Powered Keyword Research & Search Volume Analysis Active</p>
      </footer>
    </div>
  );
};

const CopyField: React.FC<{ label: string, content: string, multiline?: boolean }> = ({ label, content, multiline }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
        <button 
          onClick={handleCopy}
          className={`text-xs font-semibold px-2 py-1 rounded transition-all ${copied ? 'bg-green-100 text-green-700' : 'hover:bg-gray-200 text-gray-600'}`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className={`p-4 text-gray-800 ${multiline ? 'min-h-[100px] whitespace-pre-wrap text-sm leading-relaxed' : 'font-medium'}`}>
        {content || <span className="text-gray-300 italic">None selected</span>}
      </div>
    </div>
  );
};

export default App;
