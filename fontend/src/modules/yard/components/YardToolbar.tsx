import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Compass,
  Truck,
  Eye,
  Layers,
  Flame,
  Route,
  Grid
} from 'lucide-react';

interface YardToolbarProps {
  scale: number;
  viewMode: 'OVERVIEW' | 'DETAIL';
  showRoads: boolean;
  showForklifts: boolean;
  showHeatmap: boolean;
  showLabels: boolean;
  showGrid: boolean;
  isFullscreen: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitMap: () => void;
  onCenterMap: () => void;
  onResetView: () => void;
  onToggleFullscreen: () => void;
  onToggleRoads: () => void;
  onToggleForklifts: () => void;
  onToggleHeatmap: () => void;
  onToggleLabels: () => void;
  onToggleGrid: () => void;
  onChangeViewMode: (mode: 'OVERVIEW' | 'DETAIL') => void;
}

export const YardToolbar: React.FC<YardToolbarProps> = ({
  scale,
  viewMode,
  showRoads,
  showForklifts,
  showHeatmap,
  showLabels,
  showGrid,
  isFullscreen,
  onZoomIn,
  onZoomOut,
  onFitMap,
  onCenterMap,
  onResetView,
  onToggleFullscreen,
  onToggleRoads,
  onToggleForklifts,
  onToggleHeatmap,
  onToggleLabels,
  onToggleGrid,
  onChangeViewMode
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white backdrop-blur border border-slate-200 rounded-2xl shadow-xl">
      {/* Left: View Mode & Layer Toggles */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Mode Switcher */}
        <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => onChangeViewMode('OVERVIEW')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'OVERVIEW'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Toàn Cảnh (Overview)</span>
          </button>
          <button
            onClick={() => onChangeViewMode('DETAIL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'DETAIL'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Chi Tiết Bay/Row</span>
          </button>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-slate-100 hidden sm:block" />

        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleRoads}
            title="Bật/Tắt Tuyến Đường Xe Nâng"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
              showRoads
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-700'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Đường</span>
          </button>

          <button
            onClick={onToggleForklifts}
            title="Bật/Tắt Vị Trí Xe Nâng"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
              showForklifts
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-700'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Xe Nâng</span>
          </button>

          <button
            onClick={onToggleHeatmap}
            title="Bật/Tắt Bản Đồ Nhiệt Công Suất Lấp Đầy"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
              showHeatmap
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Heatmap</span>
          </button>

          <button
            onClick={onToggleGrid}
            title="Bật/Tắt Lưới Tọa Độ (Grid)"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
              showGrid
                ? 'bg-slate-100 text-teal-700 border-teal-200'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-700'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Lưới</span>
          </button>
        </div>
      </div>

      {/* Right: Zoom & Navigation Controls */}
      <div className="flex items-center gap-1.5 ml-auto">
        {/* Current Scale Display */}
        <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 font-bold min-w-[58px] text-center">
          {Math.round(scale * 100)}%
        </div>

        {/* Zoom Out Button */}
        <button
          onClick={onZoomOut}
          title="Thu Nhỏ (Zoom Out)"
          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl transition cursor-pointer active:scale-95"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Zoom In Button */}
        <button
          onClick={onZoomIn}
          title="Phóng To (Zoom In)"
          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl transition cursor-pointer active:scale-95"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Fit Map */}
        <button
          onClick={onFitMap}
          title="Vừa Màn Hình (Fit Map)"
          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 flex items-center gap-1"
        >
          <span>FIT</span>
        </button>

        {/* Center Depot */}
        <button
          onClick={onCenterMap}
          title="Căn Giữa Depot"
          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl transition cursor-pointer active:scale-95"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Reset View */}
        <button
          onClick={onResetView}
          title="Khôi Phục Tọa Độ Ban Đầu"
          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl transition cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Thoát Toàn Màn Hình' : 'Toàn Màn Hình (Fullscreen)'}
          className="p-2 bg-teal-50 hover:bg-teal-50 text-teal-700 border border-teal-200 rounded-xl transition cursor-pointer active:scale-95"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
