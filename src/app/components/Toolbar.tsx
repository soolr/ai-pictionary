"use client";

interface ToolbarProps {
  color: string;
  setColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  isEraser: boolean;
  setIsEraser: (value: boolean) => void;
  onClear: () => void;
}

const COLORS = [
  "#000000",
  "#e94560",
  "#0f3460",
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

const BRUSH_SIZES = [
  { value: 3, label: "细" },
  { value: 8, label: "中" },
  { value: 15, label: "粗" },
];

export default function Toolbar({
  color,
  setColor,
  brushSize,
  setBrushSize,
  isEraser,
  setIsEraser,
  onClear,
}: ToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-[#111111] rounded-xl border border-[#2a2a2a]">
      {/* Colors */}
      <div className="flex flex-col gap-2">
        <span className="text-[#888888] text-xs font-medium uppercase tracking-wider">颜色</span>
        <div className="flex flex-wrap gap-2 max-w-[280px] sm:max-w-none">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setIsEraser(false);
              }}
              className={`w-8 h-8 rounded-full shadow-md transition-all duration-200 hover:scale-110 ${
                color === c && !isEraser
                  ? "ring-2 ring-white ring-offset-2 ring-offset-[#111111]"
                  : "opacity-80 hover:opacity-100"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Brush Sizes */}
      <div className="flex flex-col gap-2">
        <span className="text-[#888888] text-xs font-medium uppercase tracking-wider">粗细</span>
        <div className="flex gap-2">
          {BRUSH_SIZES.map((size) => (
            <button
              key={size.value}
              onClick={() => {
                setBrushSize(size.value);
                setIsEraser(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                brushSize === size.value && !isEraser
                  ? "bg-[#bb86fc] text-black shadow-lg shadow-purple-500/30"
                  : "bg-[#222222] text-[#b0b0b0] hover:bg-[#333333]"
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        <button
          onClick={() => setIsEraser(!isEraser)}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            isEraser
              ? "bg-[#bb86fc] text-black shadow-lg shadow-purple-500/30"
              : "bg-[#222222] text-[#b0b0b0] hover:bg-[#333333]"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          橡皮擦
        </button>
        <button
          onClick={onClear}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm font-medium bg-[#bb86fc] text-black hover:bg-[#9965f4] transition-all shadow-md flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          清除
        </button>
      </div>
    </div>
  );
}
