"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface CanvasProps {
  onImageReady?: (base64: string) => void;
  color?: string;
  brushSize?: number;
  isEraser?: boolean;
  setClearFn?: (fn: () => void) => void;
  setGetImageDataFn?: (fn: () => string) => void;
  setTriggerFn?: (fn: () => void) => void;
}

export default function Canvas({ 
  onImageReady, 
  color: externalColor,
  brushSize: externalBrushSize,
  isEraser: externalIsEraser,
  setClearFn,
  setGetImageDataFn,
  setTriggerFn
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const color = externalColor ?? "#000000";
  const brushSize = externalBrushSize ?? 5;
  const isEraser = externalIsEraser ?? false;
  const lastPosRef = useRef({ x: 0, y: 0 });
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(imageData);
    historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  const undo = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || historyIndexRef.current <= 0) return;

    historyIndexRef.current--;
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    saveHistory();
  }, [saveHistory]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo]);

  useEffect(() => {
    if (setClearFn) {
      setClearFn(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx || !canvas) return;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveHistory();
      });
    }
    if (setGetImageDataFn) {
      setGetImageDataFn(() => {
        const canvas = canvasRef.current;
        if (!canvas) return "";
        const dataUrl = canvas.toDataURL("image/png");
        return dataUrl.replace("data:image/png;base64,", "");
      });
    }
    if (setTriggerFn) {
      setTriggerFn(() => {
        const canvas = canvasRef.current;
        if (!canvas || !onImageReady) return;
        
        const dataUrl = canvas.toDataURL("image/png");
        const base64 = dataUrl.replace("data:image/png;base64,", "");
        if (base64) onImageReady(base64);
      });
    }
  }, [setClearFn, setGetImageDataFn, setTriggerFn, onImageReady, saveHistory]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    lastPosRef.current = pos;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const pos = getPos(e);
    const prevPos = lastPosRef.current;

    ctx.beginPath();
    ctx.moveTo(prevPos.x, prevPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = isEraser ? "#ffffff" : color;
    ctx.lineWidth = isEraser ? brushSize * 3 : brushSize;
    ctx.stroke();

    lastPosRef.current = pos;
  };

  const stopDrawing = () => {
    if (isDrawing) {
      saveHistory();
    }
    setIsDrawing(false);
  };

  return (
    <div className="flex justify-center mb-6">
      <div className="relative shadow-2xl rounded-xl overflow-hidden ring-1 ring-white/5">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="block cursor-crosshair touch-none bg-white max-w-full"
          style={{ 
            width: '100%', 
            height: 'auto',
            aspectRatio: '3/2'
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {/* Canvas Overlay Grid Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-3"
          style={{
            backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
      </div>
    </div>
  );
}