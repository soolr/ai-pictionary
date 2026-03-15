"use client";

import { useState, useRef, useCallback } from "react";
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar";

interface GuessResult {
  text: string;
  confidence: number;
  timestamp: number;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GuessResult[]>([]);
  const [error, setError] = useState("");
  
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const clearCanvasRef = useRef<() => void>(() => {});
  const getImageDataRef = useRef<() => string>(() => "");
  const triggerImageReadyRef = useRef<() => void>(() => {});

  const handleImageReady = useCallback(async (base64: string) => {
    if (!base64) {
      setError("请先在画布上作画");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "识别失败");
      }

      setResults((prev) => [data, ...prev].slice(0, 5));
    } catch (err) {
      setError(err instanceof Error ? err.message : "识别失败，请重试");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    clearCanvasRef.current();
  }, []);

  const handleGuess = useCallback(() => {
    triggerImageReadyRef.current();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-black">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
          AI <span className="text-[#bb86fc]">你画我猜</span>
        </h1>
        <p className="text-[#b0b0b0] text-lg">画出你的想法，让AI猜猜看</p>
      </div>

      <div className="w-full max-w-3xl flex flex-col gap-6">
        {/* Canvas Area */}
        <div className="bg-[#111111] p-6 rounded-2xl shadow-[0_0_20px_rgba(187,134,252,0.1)] border border-[#2a2a2a]">
          <Canvas 
            onImageReady={handleImageReady}
            color={color}
            brushSize={brushSize}
            isEraser={isEraser}
            setClearFn={(fn) => { clearCanvasRef.current = fn; }}
            setGetImageDataFn={(fn) => { getImageDataRef.current = fn; }}
            setTriggerFn={(fn) => { triggerImageReadyRef.current = fn; }}
          />

          <Toolbar
            color={color}
            setColor={setColor}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            isEraser={isEraser}
            setIsEraser={setIsEraser}
            onClear={handleClear}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleGuess}
            disabled={isLoading}
            className="px-10 py-4 bg-[#bb86fc] text-black font-semibold rounded-xl text-lg shadow-lg shadow-purple-500/20 hover:bg-[#9965f4] hover:shadow-purple-500/40 hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                识别中...
              </span>
            ) : (
              "开始识别"
            )}
          </button>
          <button
            onClick={handleClear}
            className="px-8 py-4 bg-[#333333] text-[#e0e0e0] font-semibold rounded-xl text-lg hover:bg-[#444444] hover:text-white transition-all duration-200 shadow-md"
          >
            重置画布
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800/50 text-red-400 px-6 py-4 rounded-xl text-center flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Results Area */}
        {results.length > 0 && (
          <div className="bg-[#111111] p-6 rounded-2xl shadow-[0_0_20px_rgba(187,134,252,0.1)] border border-[#2a2a2a]">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#bb86fc] rounded-full"></span>
              AI 猜测结果
            </h2>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={result.timestamp}
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    index === 0 
                      ? "bg-gradient-to-r from-[#bb86fc]/10 to-transparent border border-[#bb86fc]/30" 
                      : "bg-[#222222] hover:bg-[#2a2a2a]"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#b0b0b0] text-sm font-medium">
                      猜测 #{results.length - index}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${result.confidence > 0.7 ? 'text-green-400' : result.confidence > 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {(result.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-lg text-white mb-3 leading-relaxed">{result.text}</p>
                  
                  <div className="w-full bg-[#222222] rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        result.confidence > 0.7 ? 'bg-green-500' : result.confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${result.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="mt-12 text-[#555555] text-sm">
        Powered by Pollinations AI
      </footer>
    </div>
  );
}