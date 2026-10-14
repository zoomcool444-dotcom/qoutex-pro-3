import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Minus,
  Maximize2,
  Clock,
  CandlestickChart,
  LineChart,
  BarChart2,
  Sliders,
  ChevronDown,
  X,
  Volume2,
  Info,
  Settings,
  Calendar,
  PenTool,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Crosshair,
  Copy,
  ChevronRight,
} from 'lucide-react';
import {
  Asset,
  Candle,
  ActiveTrade,
  IndicatorConfig,
  ChartType,
  Timeframe,
  DrawingToolType,
  DrawingItem,
  PlatformSettingsState,
} from '../types';
import {
  calculateBollingerBands,
  calculateSMA,
  calculateAlligator,
  calculateEnvelopes,
  calculateZigZag,
  calculateFractals,
  calculateParabolicSAR,
} from '../marketData';
import { AssetIcon } from './AssetIcon';
import { audio } from '../audioService';

interface ChartCanvasProps {
  asset: Asset;
  openAssets: Asset[];
  onSelectAsset: (asset: Asset) => void;
  onCloseAssetTab: (assetId: string) => void;
  candles: Candle[];
  activeTrades: ActiveTrade[];
  indicators: IndicatorConfig[];
  chartType: ChartType;
  timeframe: Timeframe;
  candleCountdown: number; // remaining seconds for current candle
  utcTime: string;
  onOpenAssetModal: () => void;
  onOpenIndicators: () => void;
  onOpenDrawingModal: () => void;
  onChangeChartType: (type: ChartType) => void;
  onChangeTimeframe: (tf: Timeframe) => void;
  onRemoveIndicator: (id: string) => void;
  onUpdateIndicator?: (indicator: IndicatorConfig) => void;
  activeDrawingTool: DrawingToolType | null;
  onClearDrawingTool: () => void;
  drawings: DrawingItem[];
  onAddDrawing: (drawing: DrawingItem) => void;
  onUpdateDrawing: (drawing: DrawingItem) => void;
  onRemoveDrawing: (id: string) => void;
  onClearAllDrawings: () => void;
  settings?: PlatformSettingsState;
}

export const ChartCanvas: React.FC<ChartCanvasProps> = ({
  asset,
  openAssets,
  onSelectAsset,
  onCloseAssetTab,
  candles,
  activeTrades,
  indicators,
  chartType,
  timeframe,
  candleCountdown,
  utcTime,
  onOpenAssetModal,
  onOpenIndicators,
  onOpenDrawingModal,
  onChangeChartType,
  onChangeTimeframe,
  onRemoveIndicator,
  onUpdateIndicator,
  activeDrawingTool,
  onClearDrawingTool,
  drawings,
  onAddDrawing,
  onUpdateDrawing,
  onRemoveDrawing,
  onClearAllDrawings,
  settings,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showPairInfo, setShowPairInfo] = useState(false);
  const [editingIndicatorId, setEditingIndicatorId] = useState<string | null>(null);

  // Selected drawing for settings toolbar
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);

  // Two-point drawing in progress (Trend Line, Ray, Rectangle, Fibonacci)
  const [pendingAnchor, setPendingAnchor] = useState<{ price: number; time: number } | null>(null);

  // Viewport State: zoom level & horizontal pan offset
  const [visibleCount, setVisibleCount] = useState<number>(65); // number of candles visible (12 to 350)
  const [panOffset, setPanOffset] = useState<number>(-8); // pan in candles (-8 gives forward room for future projection & trading)
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartOffset, setDragStartOffset] = useState<number>(0);

  // Dragging a drawing line
  const [draggingDrawingId, setDraggingDrawingId] = useState<string | null>(null);

  // Crosshair coordinates & hovered candle
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [crosshairPrice, setCrosshairPrice] = useState<number | null>(null);
  const [crosshairTime, setCrosshairTime] = useState<number | null>(null);

  // Dropdown states for bottom-left toolbar
  const [showTimeframeMenu, setShowTimeframeMenu] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  // Zoom handlers: Proportional smooth zooming (moves background boxes and candles together)
  const handleZoomIn = () => {
    setVisibleCount((prev) => Math.max(12, Math.round(prev * 0.82)));
  };

  const handleZoomOut = () => {
    setVisibleCount((prev) => Math.min(350, Math.round(prev * 1.22)));
  };

  const handleResetView = () => {
    setVisibleCount(65);
    setPanOffset(-8);
  };

  // Mouse Wheel Zoom: dynamically adjusts visible count and scales boxes
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomIn = e.deltaY < 0;
    setVisibleCount((prev) => {
      const delta = Math.max(2, Math.round(prev * 0.08));
      const next = zoomIn ? prev - delta : prev + delta;
      return Math.max(12, Math.min(350, next));
    });
  };

  // Helper coordinate conversions used by mouse interactions
  const getCanvasCoords = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const plotWidth = width - 80; // price axis width
    const plotHeight = height - 28; // time axis height

    const minPan = -Math.round(visibleCount * 0.7);
    const maxPan = Math.max(0, candles.length - 5);
    const clampedOffset = Math.max(minPan, Math.min(maxPan, panOffset));
    const endIdx = candles.length - clampedOffset;
    const startIdx = Math.max(0, endIdx - visibleCount);
    const visibleCandles = candles.slice(startIdx, Math.min(candles.length, endIdx));

    if (visibleCandles.length === 0 && candles.length === 0) return null;

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    visibleCandles.forEach((c) => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    });

    if (minPrice === Infinity || maxPrice === -Infinity || minPrice === maxPrice) {
      minPrice = asset.basePrice * 0.998;
      maxPrice = asset.basePrice * 1.002;
    }

    const padding = (maxPrice - minPrice) * 0.1 || asset.basePrice * 0.002;
    minPrice -= padding;
    maxPrice += padding;

    const candleWidth = plotWidth / visibleCount;

    const priceToY = (price: number) => {
      return plotHeight - ((price - minPrice) / (maxPrice - minPrice)) * plotHeight;
    };

    const yToPrice = (y: number) => {
      return +(maxPrice - (y / plotHeight) * (maxPrice - minPrice)).toFixed(asset.decimals);
    };

    const indexToX = (idx: number) => {
      const relIdx = idx - startIdx;
      return relIdx * candleWidth + candleWidth / 2;
    };

    const xToIndex = (x: number) => {
      const relIdx = Math.floor(x / candleWidth);
      return startIdx + relIdx;
    };

    const timeToX = (timeMs: number) => {
      if (candles.length === 0) return 0;
      const timeframeMs = candles.length >= 2
        ? Math.max(1000, candles[candles.length - 1].time - candles[candles.length - 2].time)
        : 5000;
      const lastCandle = candles[candles.length - 1];
      const lastCandleIdx = candles.length - 1;
      if (timeMs > lastCandle.time) {
        const futureCount = (timeMs - lastCandle.time) / timeframeMs;
        const projectedIdx = lastCandleIdx + futureCount;
        return indexToX(projectedIdx);
      }
      if (timeMs < candles[0].time) {
        const pastCount = (candles[0].time - timeMs) / timeframeMs;
        const projectedIdx = -pastCount;
        return indexToX(projectedIdx);
      }
      let closestIdx = 0;
      let minDiff = Infinity;
      for (let i = 0; i < candles.length; i++) {
        const diff = Math.abs(candles[i].time - timeMs);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }
      return indexToX(closestIdx);
    };

    return {
      canvas,
      width,
      height,
      plotWidth,
      plotHeight,
      startIdx,
      endIdx,
      visibleCandles,
      minPrice,
      maxPrice,
      candleWidth,
      priceToY,
      yToPrice,
      indexToX,
      xToIndex,
      timeToX,
    };
  }, [candles, visibleCount, panOffset, asset]);

  // Click on chart: Place drawing or select existing drawing
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click

    const coords = getCanvasCoords();
    if (!coords) return;
    const { canvas, plotWidth, plotHeight, priceToY, timeToX, yToPrice } = coords;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (mouseX > plotWidth || mouseY > plotHeight) return;

    const clickedPrice = yToPrice(mouseY);
    const clickedIdx = coords.xToIndex(mouseX);
    const clickedCandle = coords.visibleCandles.find((_, i) => coords.startIdx + i === clickedIdx) || candles[candles.length - 1];
    const clickedTime = clickedCandle ? clickedCandle.time : Date.now();

    // 1. If an active drawing tool is selected by user
    if (activeDrawingTool) {
      if (activeDrawingTool === 'Horizontal Line') {
        const newDrawing: DrawingItem = {
          id: Math.random().toString(36).substring(2, 9),
          type: 'Horizontal Line',
          price: clickedPrice,
          time: clickedTime,
          color: '#eab308',
          lineWidth: 2,
          visible: true,
          locked: false,
        };
        onAddDrawing(newDrawing);
        setSelectedDrawingId(newDrawing.id);
        onClearDrawingTool();
        audio.playClick();
        return;
      }

      if (activeDrawingTool === 'Vertical Line') {
        const newDrawing: DrawingItem = {
          id: Math.random().toString(36).substring(2, 9),
          type: 'Vertical Line',
          price: clickedPrice,
          time: clickedTime,
          color: '#0070f3',
          lineWidth: 2,
          visible: true,
          locked: false,
        };
        onAddDrawing(newDrawing);
        setSelectedDrawingId(newDrawing.id);
        onClearDrawingTool();
        audio.playClick();
        return;
      }

      // Two-point tools: Trend Line, Ray, Rectangle, Fibonacci
      if (!pendingAnchor) {
        setPendingAnchor({ price: clickedPrice, time: clickedTime });
        audio.playClick();
        return;
      } else {
        // Complete the two-point drawing!
        const newDrawing: DrawingItem = {
          id: Math.random().toString(36).substring(2, 9),
          type: activeDrawingTool,
          price: pendingAnchor.price,
          time: pendingAnchor.time,
          price2: clickedPrice,
          time2: clickedTime,
          color:
            activeDrawingTool === 'Rectangle'
              ? '#0070f3'
              : activeDrawingTool === 'Fibonacci Retracement'
              ? '#00b074'
              : '#eab308',
          lineWidth: 2,
          visible: true,
          locked: false,
        };
        onAddDrawing(newDrawing);
        setSelectedDrawingId(newDrawing.id);
        setPendingAnchor(null);
        onClearDrawingTool();
        audio.playClick();
        return;
      }
    }

    // 2. Check if clicked near an existing drawing to select it
    let foundDrawingId: string | null = null;
    for (const d of drawings) {
      if (d.visible === false) continue;
      if (d.type === 'Horizontal Line') {
        const dy = priceToY(d.price);
        if (Math.abs(mouseY - dy) < 8) {
          foundDrawingId = d.id;
          break;
        }
      } else if (d.type === 'Vertical Line') {
        const dx = timeToX(d.time);
        if (Math.abs(mouseX - dx) < 8) {
          foundDrawingId = d.id;
          break;
        }
      } else if (d.type === 'Trend Line' || d.type === 'Ray') {
        const x1 = timeToX(d.time);
        const y1 = priceToY(d.price);
        const x2 = timeToX(d.time2 ?? d.time);
        const y2 = priceToY(d.price2 ?? d.price);
        // Distance from point to line segment
        const dist = Math.abs((y2 - y1) * mouseX - (x2 - x1) * mouseY + x2 * y1 - y2 * x1) /
          Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2) || 1);
        if (dist < 8) {
          foundDrawingId = d.id;
          break;
        }
      } else if (d.type === 'Rectangle') {
        const x1 = Math.min(timeToX(d.time), timeToX(d.time2 ?? d.time));
        const x2 = Math.max(timeToX(d.time), timeToX(d.time2 ?? d.time));
        const y1 = Math.min(priceToY(d.price), priceToY(d.price2 ?? d.price));
        const y2 = Math.max(priceToY(d.price), priceToY(d.price2 ?? d.price));
        if (mouseX >= x1 && mouseX <= x2 && mouseY >= y1 && mouseY <= y2) {
          foundDrawingId = d.id;
          break;
        }
      } else if (d.type === 'Fibonacci Retracement') {
        const y1 = Math.min(priceToY(d.price), priceToY(d.price2 ?? d.price));
        const y2 = Math.max(priceToY(d.price), priceToY(d.price2 ?? d.price));
        if (mouseY >= y1 - 8 && mouseY <= y2 + 8) {
          foundDrawingId = d.id;
          break;
        }
      }
    }

    if (foundDrawingId) {
      setSelectedDrawingId(foundDrawingId);
      const clickedD = drawings.find((d) => d.id === foundDrawingId);
      if (clickedD && !clickedD.locked) {
        setDraggingDrawingId(foundDrawingId);
      }
      return;
    }

    // Unselect if clicked empty space
    setSelectedDrawingId(null);

    // 3. Pan dragging
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartOffset(panOffset);
  };

  // Drag Pan move & Crosshair update
  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoords();
    if (!coords) return;
    const { canvas, plotWidth, plotHeight, yToPrice, candleWidth, startIdx, visibleCandles } = coords;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Handle dragging drawing price
    if (draggingDrawingId) {
      const activeD = drawings.find((d) => d.id === draggingDrawingId);
      if (activeD && !activeD.locked) {
        const newPrice = yToPrice(mouseY);
        onUpdateDrawing({ ...activeD, price: newPrice });
      }
      return;
    }

    if (isDragging) {
      const deltaX = e.clientX - dragStartX;
      const offsetDelta = Math.round(deltaX / candleWidth);
      const minPan = -Math.round(visibleCount * 0.7);
      const maxPan = Math.max(0, candles.length - 5);
      setPanOffset(Math.max(minPan, Math.min(maxPan, dragStartOffset + offsetDelta)));
      return;
    }

    // Inside plot area: track crosshair
    if (mouseX <= plotWidth && mouseY <= plotHeight) {
      setCrosshairPos({ x: mouseX, y: mouseY });
      const currentHoverPrice = yToPrice(mouseY);
      setCrosshairPrice(currentHoverPrice);

      const relIdx = Math.floor(mouseX / candleWidth);
      if (relIdx >= 0 && relIdx < visibleCandles.length) {
        const c = visibleCandles[relIdx];
        setHoveredCandle(c);
        setCrosshairTime(c.time);
      } else {
        setHoveredCandle(null);
      }
    } else {
      setCrosshairPos(null);
      setHoveredCandle(null);
      setCrosshairPrice(null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingDrawingId(null);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setDraggingDrawingId(null);
    setCrosshairPos(null);
    setHoveredCandle(null);
  };

  // Render High-Frequency Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Match canvas dimensions to container in Full HD 2x retina resolution
    const width = container.clientWidth;
    const height = container.clientHeight;
    const dpr = Math.max(window.devicePixelRatio || 1, 2);

    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.save();
    ctx.scale(dpr, dpr);

    const plotWidth = width - 80; // price axis width
    const plotHeight = height - 28; // time axis height

    // Clear background (Exact Quotex dark slate navy from Screenshot)
    ctx.fillStyle = '#131722';
    ctx.fillRect(0, 0, width, height);

    // Right price axis background strip
    ctx.fillStyle = '#10141d';
    ctx.fillRect(plotWidth, 0, width - plotWidth, height);

    // Bottom time axis background strip
    ctx.fillStyle = '#10141d';
    ctx.fillRect(0, plotHeight, width, height - plotHeight);

    // Axis separator borders
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(plotWidth, 0);
    ctx.lineTo(plotWidth, height);
    ctx.moveTo(0, plotHeight);
    ctx.lineTo(width, plotHeight);
    ctx.stroke();

    // 1. Watermark DEMO (Exact huge faint "DEMO" in screenshot)
    ctx.save();
    ctx.font = '900 130px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DEMO', plotWidth / 2, plotHeight / 2);
    ctx.restore();

    if (candles.length === 0) return;

    // Viewport calculations (allows moving market forward into future space)
    const minPan = -Math.round(visibleCount * 0.7);
    const maxPan = Math.max(0, candles.length - 5);
    const clampedOffset = Math.max(minPan, Math.min(maxPan, panOffset));
    const endIdx = candles.length - clampedOffset;
    const startIdx = Math.max(0, endIdx - visibleCount);
    const visibleCandles = candles.slice(startIdx, Math.min(candles.length, endIdx));

    if (visibleCandles.length === 0 && candles.length === 0) return;

    // Price scaling
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    visibleCandles.forEach((c) => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    });

    if (minPrice === Infinity || maxPrice === -Infinity || minPrice === maxPrice) {
      minPrice = asset.basePrice * 0.998;
      maxPrice = asset.basePrice * 1.002;
    }

    const padding = (maxPrice - minPrice) * 0.1 || asset.basePrice * 0.002;
    minPrice -= padding;
    maxPrice += padding;

    const candleWidth = plotWidth / visibleCount;
    const bodyWidth = Math.max(2, candleWidth * 0.72);

    const priceToY = (price: number) => {
      return plotHeight - ((price - minPrice) / (maxPrice - minPrice)) * plotHeight;
    };

    const indexToX = (idx: number) => {
      const relIdx = idx - startIdx;
      return relIdx * candleWidth + candleWidth / 2;
    };

    const timeToX = (timeMs: number) => {
      if (candles.length === 0) return 0;
      const tfMs = candles.length >= 2
        ? Math.max(1000, candles[candles.length - 1].time - candles[candles.length - 2].time)
        : 5000;
      const lastCandle = candles[candles.length - 1];
      const lastCandleIdx = candles.length - 1;
      if (timeMs > lastCandle.time) {
        const futureCount = (timeMs - lastCandle.time) / tfMs;
        const projectedIdx = lastCandleIdx + futureCount;
        return indexToX(projectedIdx);
      }
      if (timeMs < candles[0].time) {
        const pastCount = (candles[0].time - timeMs) / tfMs;
        const projectedIdx = -pastCount;
        return indexToX(projectedIdx);
      }
      let closestIdx = 0;
      let minDiff = Infinity;
      for (let i = 0; i < candles.length; i++) {
        const diff = Math.abs(candles[i].time - timeMs);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }
      return indexToX(closestIdx);
    };

    // 2. Dynamic Responsive Grid Lines & Background Boxes (Matching Quotex Video)
    // As the user zooms in/out or drags/advances the market forward, background boxes smoothly scale and move in real time!
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;

    // A. Dynamic Horizontal Price Grid Lines & Right Price Axis Labels (Boxes scale vertically with zoom and move with price)
    const priceRange = maxPrice - minPrice;
    const targetYSpacing = 50; // slightly smaller, tighter box height (was 65px)
    const approxRows = Math.max(4, Math.round(plotHeight / targetYSpacing));
    const rawPriceStep = priceRange / approxRows;

    const getNicePriceStep = (step: number): number => {
      if (step <= 0 || !isFinite(step)) return 1;
      const power = Math.pow(10, Math.floor(Math.log10(step)));
      const frac = step / power;
      let niceFrac = 1;
      if (frac > 1.2 && frac <= 2.5) niceFrac = 2;
      else if (frac > 2.5 && frac <= 6) niceFrac = 5;
      else if (frac > 6) niceFrac = 10;
      return niceFrac * power;
    };

    const priceStep = getNicePriceStep(rawPriceStep);
    const firstPrice = Math.floor(minPrice / priceStep) * priceStep;
    const lastPrice = Math.ceil(maxPrice / priceStep) * priceStep;

    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    for (let p = firstPrice; p <= lastPrice + priceStep * 0.5; p += priceStep) {
      const y = priceToY(p);
      if (y >= -1 && y <= plotHeight + 1) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(plotWidth, y);
        ctx.stroke();

        ctx.fillStyle = '#8a99ad';
        ctx.fillText(p.toFixed(asset.decimals), plotWidth + 6, y);
      }
    }

    // B. Dynamic Vertical Time Grid Lines & Bottom Time Axis Labels (Boxes scale horizontally with zoom and move with market)
    const timeframeMs = candles.length >= 2
      ? Math.max(1000, candles[candles.length - 1].time - candles[candles.length - 2].time)
      : 5000;

    const niceSteps = [1, 2, 3, 5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 360, 720];
    let candleStep = 8;
    for (const s of niceSteps) {
      if (s * candleWidth >= 65) {
        candleStep = s;
        break;
      }
    }

    const firstGridIdx = Math.floor(startIdx / candleStep) * candleStep;
    const lastGridIdx = Math.ceil(endIdx / candleStep) * candleStep;
    const isMultiDay = candles.length > 0 && 
      (candles[candles.length - 1].time - candles[0].time) > 48 * 3600 * 1000;

    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#8a99ad';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let gIdx = firstGridIdx; gIdx <= lastGridIdx; gIdx += candleStep) {
      const x = indexToX(gIdx);
      if (x >= -2 && x <= plotWidth + 2) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, plotHeight);
        ctx.stroke();

        // Calculate timestamp for this grid line (handles history, live, and future forward space)
        let timeAtGrid: number;
        if (gIdx >= 0 && gIdx < candles.length) {
          timeAtGrid = candles[gIdx].time;
        } else if (candles.length > 0) {
          timeAtGrid = candles[candles.length - 1].time + (gIdx - (candles.length - 1)) * timeframeMs;
        } else {
          timeAtGrid = Date.now();
        }

        const date = new Date(timeAtGrid);
        let timeLabel: string;
        if (isMultiDay) {
          const dd = date.getUTCDate().toString().padStart(2, '0');
          const mm = (date.getUTCMonth() + 1).toString().padStart(2, '0');
          timeLabel = `${dd}.${mm}`;
        } else if (timeframeMs < 60000 && candleStep * timeframeMs < 60000) {
          const hh = date.getUTCHours().toString().padStart(2, '0');
          const mm = date.getUTCMinutes().toString().padStart(2, '0');
          const ss = date.getUTCSeconds().toString().padStart(2, '0');
          timeLabel = `${hh}:${mm}:${ss}`;
        } else {
          timeLabel = `${date.getUTCHours().toString().padStart(2, '0')}:${date
            .getUTCMinutes()
            .toString()
            .padStart(2, '0')}`;
        }

        ctx.fillText(timeLabel, x, plotHeight + 14);
      }
    }

    // Highlighted White Date Pill on Bottom Axis (Matching Quotex Video: stays directly under active candle)
    if (candles.length > 0) {
      const lastCandle = candles[candles.length - 1];
      const lastDate = new Date(lastCandle.time);
      const highlightedLabel = `${lastDate.getUTCDate().toString().padStart(2, '0')}.${(lastDate.getUTCMonth() + 1).toString().padStart(2, '0')}`;
      const lastIdx = candles.length - 1;
      const candleScreenX = indexToX(lastIdx);

      // Only draw the highlighted pill if the active candle is within the visible plot area
      if (candleScreenX >= 10 && candleScreenX <= plotWidth - 10) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(candleScreenX - 22, plotHeight + 5, 44, 18, 4);
        ctx.fill();

        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(highlightedLabel, candleScreenX, plotHeight + 14);
      }
    }

    // 3. Draw Indicators
    indicators.forEach((ind) => {
      if (!ind.enabled) return;
      ctx.lineWidth = ind.lineWidth || 1.8;

      if (ind.type === 'Bollinger Bands') {
        const bb = calculateBollingerBands(candles, ind.period || 20, ind.deviation || 2);
        const midColor = ind.color || '#eab308';
        const upperColor = ind.colorSecondary || '#0070f3';
        const lowerColor = ind.colorTertiary || '#0070f3';

        // Upper line
        ctx.strokeStyle = upperColor;
        ctx.beginPath();
        visibleCandles.forEach((_, idx) => {
          const globalIdx = startIdx + idx;
          const val = bb.upper[globalIdx];
          if (val !== null) {
            const x = indexToX(globalIdx);
            const y = priceToY(val);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        });
        ctx.stroke();

        // Middle line
        ctx.strokeStyle = midColor;
        ctx.beginPath();
        visibleCandles.forEach((_, idx) => {
          const globalIdx = startIdx + idx;
          const val = bb.middle[globalIdx];
          if (val !== null) {
            const x = indexToX(globalIdx);
            const y = priceToY(val);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        });
        ctx.stroke();

        // Lower line
        ctx.strokeStyle = lowerColor;
        ctx.beginPath();
        visibleCandles.forEach((_, idx) => {
          const globalIdx = startIdx + idx;
          const val = bb.lower[globalIdx];
          if (val !== null) {
            const x = indexToX(globalIdx);
            const y = priceToY(val);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      } else if (ind.type === 'Moving Average') {
        const sma = calculateSMA(candles, ind.period || 14);
        ctx.strokeStyle = ind.color || '#0070f3';
        ctx.beginPath();
        visibleCandles.forEach((_, idx) => {
          const globalIdx = startIdx + idx;
          const val = sma[globalIdx];
          if (val !== null) {
            const x = indexToX(globalIdx);
            const y = priceToY(val);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      } else if (ind.type === 'Alligator') {
        const alli = calculateAlligator(candles, ind.jawsPeriod || 13, ind.teethPeriod || 8, ind.lipsPeriod || 5);

        // Jaws (Blue)
        ctx.strokeStyle = ind.color || '#0070f3';
        ctx.beginPath();
        visibleCandles.forEach((_, idx) => {
          const val = alli.jaws[startIdx + idx];
          if (val !== null) {
            const x = indexToX(startIdx + idx);
            const y = priceToY(val);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        });
        ctx.stroke();

        // Teeth (Red)
        ctx.strokeStyle = ind.colorSecondary || '#ff4757';
        ctx.beginPath();
        visibleCandles.forEach((_, idx) => {
          const val = alli.teeth[startIdx + idx];
          if (val !== null) {
            const x = indexToX(startIdx + idx);
            const y = priceToY(val);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        });
        ctx.stroke();

        // Lips (Green)
        ctx.strokeStyle = ind.colorTertiary || '#00b074';
        ctx.beginPath();
        visibleCandles.forEach((_, idx) => {
          const val = alli.lips[startIdx + idx];
          if (val !== null) {
            const x = indexToX(startIdx + idx);
            const y = priceToY(val);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      }
    });

    // 4. Draw Interactive Candlesticks / Bars / Area / Line
    if (chartType === 'candles') {
      visibleCandles.forEach((c, idx) => {
        const x = indexToX(startIdx + idx);
        const openY = priceToY(c.open);
        const closeY = priceToY(c.close);
        const highY = priceToY(c.high);
        const lowY = priceToY(c.low);

        const isUp = c.close >= c.open;
        const color = isUp ? '#00b074' : '#ff4757';

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Body
        ctx.fillStyle = color;
        const bodyY = Math.min(openY, closeY);
        const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));
        ctx.fillRect(x - bodyWidth / 2, bodyY, bodyWidth, bodyHeight);
      });
    } else if (chartType === 'area') {
      const gradient = ctx.createLinearGradient(0, 0, 0, plotHeight);
      gradient.addColorStop(0, 'rgba(0, 112, 243, 0.35)');
      gradient.addColorStop(1, 'rgba(0, 112, 243, 0.0)');

      ctx.beginPath();
      visibleCandles.forEach((c, idx) => {
        const x = indexToX(startIdx + idx);
        const y = priceToY(c.close);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.lineTo(indexToX(startIdx + visibleCandles.length - 1), plotHeight);
      ctx.lineTo(indexToX(startIdx), plotHeight);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Top line
      ctx.beginPath();
      visibleCandles.forEach((c, idx) => {
        const x = indexToX(startIdx + idx);
        const y = priceToY(c.close);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#0070f3';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      // Line
      ctx.beginPath();
      visibleCandles.forEach((c, idx) => {
        const x = indexToX(startIdx + idx);
        const y = priceToY(c.close);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#0070f3';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 5. Draw Interactive User Drawings ("draink ka barya ma batya")
    drawings.forEach((drawing) => {
      if (drawing.visible === false) return;
      const isSelected = selectedDrawingId === drawing.id;

      ctx.save();
      ctx.strokeStyle = drawing.color;
      ctx.lineWidth = drawing.lineWidth || 2;

      if (drawing.type === 'Horizontal Line') {
        const y = priceToY(drawing.price);
        if (y >= 0 && y <= plotHeight) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(plotWidth, y);
          ctx.stroke();

          // Axis Price Pill
          ctx.fillStyle = drawing.color;
          ctx.beginPath();
          ctx.roundRect(plotWidth + 4, y - 9, 64, 18, 4);
          ctx.fill();

          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.fillStyle = '#0f172a';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(drawing.price.toFixed(asset.decimals), plotWidth + 36, y);

          // Selection handles
          if (isSelected) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(60, y, 4.5, 0, Math.PI * 2);
            ctx.arc(plotWidth - 60, y, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      } else if (drawing.type === 'Vertical Line') {
        const x = timeToX(drawing.time);
        if (x >= 0 && x <= plotWidth) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, plotHeight);
          ctx.stroke();

          // Time Pill at bottom
          ctx.fillStyle = drawing.color;
          ctx.beginPath();
          ctx.roundRect(x - 24, plotHeight + 4, 48, 16, 4);
          ctx.fill();

          const date = new Date(drawing.time);
          const tStr = `${date.getUTCHours()}:${date.getUTCMinutes().toString().padStart(2, '0')}`;
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.fillStyle = '#0f172a';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tStr, x, plotHeight + 12);

          if (isSelected) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, 40, 4.5, 0, Math.PI * 2);
            ctx.arc(x, plotHeight - 40, 4.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (drawing.type === 'Trend Line') {
        const x1 = timeToX(drawing.time);
        const y1 = priceToY(drawing.price);
        const x2 = timeToX(drawing.time2 ?? drawing.time);
        const y2 = priceToY(drawing.price2 ?? drawing.price);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Anchors
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x1, y1, isSelected ? 5 : 3.5, 0, Math.PI * 2);
        ctx.arc(x2, y2, isSelected ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = drawing.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (drawing.type === 'Ray') {
        const x1 = timeToX(drawing.time);
        const y1 = priceToY(drawing.price);
        const x2 = timeToX(drawing.time2 ?? drawing.time);
        const y2 = priceToY(drawing.price2 ?? drawing.price);

        // Compute ray slope and project forward
        const dx = x2 - x1 || 1;
        const dy = y2 - y1;
        const slope = dy / dx;
        const targetX = plotWidth + 60;
        const targetY = y1 + slope * (targetX - x1);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x1, y1, 4, 0, Math.PI * 2);
        ctx.arc(x2, y2, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (drawing.type === 'Rectangle') {
        const x1 = timeToX(drawing.time);
        const y1 = priceToY(drawing.price);
        const x2 = timeToX(drawing.time2 ?? drawing.time);
        const y2 = priceToY(drawing.price2 ?? drawing.price);

        const rx = Math.min(x1, x2);
        const ry = Math.min(y1, y2);
        const rw = Math.abs(x2 - x1);
        const rh = Math.abs(y2 - y1);

        ctx.fillStyle = drawing.color.replace(')', ', 0.16)').replace('rgb', 'rgba');
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeRect(rx, ry, rw, rh);
      } else if (drawing.type === 'Fibonacci Retracement') {
        const p1 = Math.max(drawing.price, drawing.price2 ?? drawing.price);
        const p2 = Math.min(drawing.price, drawing.price2 ?? drawing.price);
        const xStart = Math.min(timeToX(drawing.time), timeToX(drawing.time2 ?? drawing.time));
        const levels = [0.0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];

        levels.forEach((lvl) => {
          const lvlPrice = p2 + (p1 - p2) * (1 - lvl);
          const y = priceToY(lvlPrice);
          ctx.save();
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = drawing.color;
          ctx.beginPath();
          ctx.moveTo(xStart, y);
          ctx.lineTo(plotWidth, y);
          ctx.stroke();

          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillStyle = drawing.color;
          ctx.textAlign = 'left';
          ctx.fillText(`${(lvl * 100).toFixed(1)}% (${lvlPrice.toFixed(asset.decimals)})`, xStart + 8, y - 3);
          ctx.restore();
        });
      } else if (drawing.type === 'Triangle') {
        const x1 = timeToX(drawing.time);
        const y1 = priceToY(drawing.price);
        const x2 = timeToX(drawing.time2 ?? drawing.time);
        const y2 = priceToY(drawing.price2 ?? drawing.price);
        const x3 = timeToX(drawing.time3 ?? (drawing.time + ((drawing.time2 ?? drawing.time) - drawing.time) * 0.5));
        const y3 = priceToY(drawing.price3 ?? (drawing.price - Math.abs((drawing.price2 ?? drawing.price) - drawing.price) * 0.8));

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.closePath();
        ctx.fillStyle = drawing.color.startsWith('#') ? drawing.color + '26' : 'rgba(0, 112, 243, 0.15)';
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        [[x1, y1], [x2, y2], [x3, y3]].forEach(([vx, vy]) => {
          ctx.beginPath();
          ctx.arc(vx, vy, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      } else if (drawing.type === 'Gann Box') {
        const x1 = Math.min(timeToX(drawing.time), timeToX(drawing.time2 ?? drawing.time));
        const x2 = Math.max(timeToX(drawing.time), timeToX(drawing.time2 ?? drawing.time));
        const y1 = Math.min(priceToY(drawing.price), priceToY(drawing.price2 ?? drawing.price));
        const y2 = Math.max(priceToY(drawing.price), priceToY(drawing.price2 ?? drawing.price));
        const w = x2 - x1 || 60;
        const h = y2 - y1 || 60;

        ctx.strokeRect(x1, y1, w, h);
        ctx.fillStyle = drawing.color.startsWith('#') ? drawing.color + '15' : 'rgba(0, 176, 116, 0.1)';
        ctx.fillRect(x1, y1, w, h);

        const gannRatios = [0.25, 0.382, 0.5, 0.618, 0.75];
        ctx.save();
        ctx.setLineDash([2, 3]);
        ctx.strokeStyle = drawing.color;
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillStyle = drawing.color;

        gannRatios.forEach((r) => {
          const ly = y1 + h * r;
          ctx.beginPath();
          ctx.moveTo(x1, ly);
          ctx.lineTo(x2, ly);
          ctx.stroke();
          ctx.fillText(r.toString(), x1 + 4, ly - 2);

          const lx = x1 + w * r;
          ctx.beginPath();
          ctx.moveTo(lx, y1);
          ctx.lineTo(lx, y2);
          ctx.stroke();
        });
        ctx.restore();
      } else if (drawing.type === 'Fibonacci Fan') {
        const x1 = timeToX(drawing.time);
        const y1 = priceToY(drawing.price);
        const x2 = timeToX(drawing.time2 ?? drawing.time);
        const y2 = priceToY(drawing.price2 ?? drawing.price);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        const fanRatios = [0.382, 0.5, 0.618];
        fanRatios.forEach((r) => {
          const midY = y1 + (y2 - y1) * r;
          const targetX = plotWidth;
          const slope = (midY - y1) / (x2 - x1 || 1);
          const targetY = y1 + slope * (targetX - x1);

          ctx.save();
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(targetX, targetY);
          ctx.stroke();
          ctx.restore();
        });
      } else if (drawing.type === 'Disjoint Channel' || drawing.type === 'Parallel Channel') {
        const x1 = timeToX(drawing.time);
        const y1 = priceToY(drawing.price);
        const x2 = timeToX(drawing.time2 ?? drawing.time);
        const y2 = priceToY(drawing.price2 ?? drawing.price);
        const channelOffset = 35;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2, y2 + channelOffset);
        ctx.lineTo(x1, y1 + channelOffset);
        ctx.closePath();
        ctx.fillStyle = drawing.color.startsWith('#') ? drawing.color + '20' : 'rgba(0, 112, 243, 0.12)';
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x1, y1 + channelOffset / 2);
        ctx.lineTo(x2, y2 + channelOffset / 2);
        ctx.stroke();
        ctx.restore();
      } else if (drawing.type === 'Flat Top/Bottom') {
        const x1 = timeToX(drawing.time);
        const y1 = priceToY(drawing.price);
        const x2 = timeToX(drawing.time2 ?? drawing.time);
        const y2 = priceToY(drawing.price2 ?? drawing.price);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y1);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x1, y2);
        ctx.lineTo(x2, y1);
        ctx.stroke();
      } else if (drawing.type === 'Date and Price Range' || drawing.type === 'Price Range') {
        const x1 = Math.min(timeToX(drawing.time), timeToX(drawing.time2 ?? drawing.time));
        const x2 = Math.max(timeToX(drawing.time), timeToX(drawing.time2 ?? drawing.time));
        const y1 = Math.min(priceToY(drawing.price), priceToY(drawing.price2 ?? drawing.price));
        const y2 = Math.max(priceToY(drawing.price), priceToY(drawing.price2 ?? drawing.price));
        const w = x2 - x1 || 80;
        const h = y2 - y1 || 40;

        ctx.fillStyle = 'rgba(0, 176, 116, 0.15)';
        ctx.fillRect(x1, y1, w, h);
        ctx.strokeRect(x1, y1, w, h);

        const cx = x1 + w / 2;
        const cy = y1 + h / 2;
        ctx.fillStyle = '#00b074';
        ctx.beginPath();
        ctx.roundRect(cx - 55, cy - 14, 110, 28, 4);
        ctx.fill();

        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('95 bars, 15d 17h', cx, cy - 5);
        ctx.fillText('+112.50 (+2.45%)', cx, cy + 6);
      } else if (drawing.type === 'Arc' || drawing.type === 'Curve') {
        const x1 = timeToX(drawing.time);
        const y1 = priceToY(drawing.price);
        const x2 = timeToX(drawing.time2 ?? drawing.time);
        const y2 = priceToY(drawing.price2 ?? drawing.price);
        const midX = (x1 + x2) / 2;
        const midY = Math.min(y1, y2) - Math.abs(x2 - x1) * 0.35;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(midX, midY, x2, y2);
        ctx.stroke();
      } else if (drawing.type === 'Cross Line') {
        const x = timeToX(drawing.time);
        const y = priceToY(drawing.price);
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(plotWidth, y);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, plotHeight);
        ctx.stroke();
        ctx.restore();
      } else if (drawing.type === 'Extended Line') {
        const x1 = timeToX(drawing.time);
        const y1 = priceToY(drawing.price);
        const x2 = timeToX(drawing.time2 ?? drawing.time);
        const y2 = priceToY(drawing.price2 ?? drawing.price);
        const dx = x2 - x1 || 1;
        const dy = y2 - y1;
        const slope = dy / dx;

        ctx.beginPath();
        ctx.moveTo(0, y1 - slope * x1);
        ctx.lineTo(plotWidth, y1 + slope * (plotWidth - x1));
        ctx.stroke();
      }

      ctx.restore();
    });

    // 6. Draw Pending Drawing in Progress (preview while moving mouse)
    if (activeDrawingTool && pendingAnchor && crosshairPrice && crosshairPos) {
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;

      const x1 = timeToX(pendingAnchor.time);
      const y1 = priceToY(pendingAnchor.price);
      const x2 = crosshairPos.x;
      const y2 = crosshairPos.y;

      if (activeDrawingTool === 'Trend Line' || activeDrawingTool === 'Ray') {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      } else if (activeDrawingTool === 'Rectangle') {
        const rx = Math.min(x1, x2);
        const ry = Math.min(y1, y2);
        const rw = Math.abs(x2 - x1);
        const rh = Math.abs(y2 - y1);
        ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeRect(rx, ry, rw, rh);
      }
      ctx.restore();
    }

    // 7. Vertical Timeline: Beginning and End of trade markers (matching Quotex Image 2)
    const latestCandle = candles[candles.length - 1];
    const currentPriceY = priceToY(latestCandle.close);
    const lastCandleIdx = candles.length - 1;
    const beginTradeX = indexToX(lastCandleIdx);
    const endTradeX = indexToX(lastCandleIdx + 5);

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(beginTradeX, 0);
    ctx.lineTo(beginTradeX, plotHeight);
    ctx.stroke();

    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText('Beginning of trade', beginTradeX, 22);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.moveTo(endTradeX, 0);
    ctx.lineTo(endTradeX, plotHeight);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText('End of trade', endTradeX, 22);

    // Countdown tag on the vertical line like in Quotex (Image 2)
    const countdownText = `00:${candleCountdown.toString().padStart(2, '0')}`;
    ctx.fillStyle = '#1e2536';
    ctx.beginPath();
    ctx.roundRect(endTradeX + 6, currentPriceY - 8, 38, 16, 3);
    ctx.fill();
    ctx.strokeStyle = '#3b455b';
    ctx.stroke();
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(countdownText, endTradeX + 25, currentPriceY);
    ctx.restore();

    // 8. Current Price Line & Blue Right Axis Pill (Matching Red Circle 2)
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, currentPriceY);
    ctx.lineTo(plotWidth, currentPriceY);
    ctx.stroke();

    // Time tag on the price line (Matching Screenshot: 09:57:17)
    const timeRemainingStr = `09:57:${candleCountdown.toString().padStart(2, '0')}`;
    ctx.fillStyle = '#1e2536';
    ctx.beginPath();
    ctx.roundRect(endTradeX + 6, currentPriceY - 8, 48, 16, 3);
    ctx.fill();
    ctx.strokeStyle = '#3b455b';
    ctx.stroke();
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(timeRemainingStr, endTradeX + 30, currentPriceY);
    ctx.restore();

    // Right axis price pill in Quotex signature blue (Matching Red Circle 2)
    ctx.fillStyle = '#0070f3';
    ctx.beginPath();
    ctx.roundRect(plotWidth + 4, currentPriceY - 10, 72, 20, 4);
    ctx.fill();

    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(latestCandle.close.toFixed(asset.decimals), plotWidth + 40, currentPriceY);

    // 9. Active Trade Entry Pin & Badge (Quotex HD Pin at trade location, without screen-spanning horizontal line)
    if (activeTrades && activeTrades.length > 0) {
      activeTrades.forEach((trade) => {
        if (trade.assetId !== asset.id) return;
        const isCall = trade.direction === 'call';
        const entryY = priceToY(trade.entryPrice);
        const entryX = timeToX(trade.startTime);

        // Draw pin only if within horizontal bounds or near visible area
        if (entryX >= -60 && entryX <= plotWidth + 60) {
          ctx.save();
          const tradeColor = isCall ? '#00b074' : '#ff4757';
          const currentPrice = latestCandle.close;
          const isWinning = isCall ? currentPrice > trade.entryPrice : currentPrice < trade.entryPrice;

          // Glowing pulse ring
          ctx.strokeStyle = tradeColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(entryX, entryY, 11, 0, Math.PI * 2);
          ctx.stroke();

          // Circular filled badge
          ctx.fillStyle = tradeColor;
          ctx.beginPath();
          ctx.arc(entryX, entryY, 7.5, 0, Math.PI * 2);
          ctx.fill();

          // Arrow icon
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(isCall ? '▲' : '▼', entryX, entryY);

          // Neat localized Quotex trade badge (compact, right beside the pin, NOT an endless screen-spanning line)
          const badgeText = `${trade.amount} $ • ${trade.remainingSeconds}s`;
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          const textMetrics = ctx.measureText(badgeText);
          const badgeWidth = textMetrics.width + 16;
          const badgeX = Math.min(plotWidth - badgeWidth - 8, Math.max(10, entryX + 14));
          const badgeY = entryY - 11;

          // Badge pill container
          ctx.fillStyle = '#141a26';
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, badgeWidth, 22, 5);
          ctx.fill();
          ctx.strokeStyle = isWinning ? '#00b074' : tradeColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Badge text
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(badgeText, badgeX + 8, badgeY + 11);

          // Connecting small tick line from pin to badge
          ctx.strokeStyle = tradeColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(entryX + 8, entryY);
          ctx.lineTo(badgeX, badgeY + 11);
          ctx.stroke();

          ctx.restore();
        }
      });
    }

    // 10. Crosshair Lines ("mouse ma + ka jo lins ha")
    if (crosshairPos && crosshairPos.x <= plotWidth && crosshairPos.y <= plotHeight) {
      const cx = crosshairPos.x;
      const cy = crosshairPos.y;

      ctx.save();
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;

      // Horizontal crosshair
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(plotWidth, cy);
      ctx.stroke();

      // Vertical crosshair
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, plotHeight);
      ctx.stroke();
      ctx.restore();

      // Price Tag on Right Axis
      if (crosshairPrice !== null) {
        ctx.fillStyle = '#222938';
        ctx.beginPath();
        ctx.roundRect(plotWidth + 4, cy - 9, 64, 18, 4);
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.stroke();

        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(crosshairPrice.toFixed(asset.decimals), plotWidth + 36, cy);
      }

      // Time Tag on Bottom Axis
      if (crosshairTime !== null) {
        const dt = new Date(crosshairTime);
        const timeLabel = `${dt.getUTCHours().toString().padStart(2, '0')}:${dt
          .getUTCMinutes()
          .toString()
          .padStart(2, '0')}:${dt.getUTCSeconds().toString().padStart(2, '0')}`;
        ctx.fillStyle = '#222938';
        ctx.beginPath();
        ctx.roundRect(cx - 32, plotHeight + 4, 64, 18, 4);
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.stroke();

        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(timeLabel, cx, plotHeight + 13);
      }
    }

    ctx.restore();
  }, [
    candles,
    visibleCount,
    panOffset,
    chartType,
    indicators,
    activeTrades,
    crosshairPos,
    crosshairPrice,
    crosshairTime,
    drawings,
    selectedDrawingId,
    activeDrawingTool,
    pendingAnchor,
    asset,
  ]);

  const selectedDrawing = drawings.find((d) => d.id === selectedDrawingId);
  const colorOptions = ['#eab308', '#00b074', '#ff4757', '#0070f3', '#ffffff', '#06b6d4', '#a855f7'];

  return (
    <div className="flex-1 h-full relative overflow-hidden bg-[#131722] flex flex-col select-none">
      {/* 1. Multi-Asset Tabs Bar at top of chart (Matching Screenshot Red Circle 2) */}
      <div className="h-12 bg-[#141824] border-b border-[#202738] px-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2 overflow-x-auto max-w-[calc(100vw-380px)] pr-2 py-0.5 scrollbar-none">
          {/* Blue Plus Button (Matching Screenshot left of Red Circle 2) */}
          <button
            onClick={onOpenAssetModal}
            title="Add Trading Pair"
            className="w-8 h-8 rounded-lg bg-[#0070f3] hover:bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Red Circle 2: Active Asset Dropdown Pill */}
          <div
            onClick={onOpenAssetModal}
            className="bg-[#161c28] hover:bg-[#1e2536] border border-[#2b364a] hover:border-[#3b4964] rounded-xl px-3.5 py-1.5 flex items-center gap-2.5 cursor-pointer shadow-md transition-all shrink-0"
          >
            <AssetIcon symbol={asset.symbol} category={asset.category} size={22} />
            <div className="flex flex-col text-left leading-tight">
              <span className="font-bold text-white text-xs leading-none mb-0.5">{asset.name}</span>
              <span className="text-[#f59e0b] font-black text-[11px] leading-none">{asset.payout1m}%</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          </div>

          {/* Additional open asset tabs */}
          {openAssets
            .filter((a) => a.id !== asset.id)
            .map((a) => (
              <div
                key={a.id}
                onClick={() => onSelectAsset(a)}
                className="h-8 px-2.5 rounded-xl bg-[#121620] hover:bg-[#1a2130] border border-[#222938] text-slate-400 hover:text-white flex items-center gap-2 cursor-pointer transition-colors text-xs font-bold shrink-0"
              >
                <AssetIcon symbol={a.symbol} category={a.category} size={16} />
                <span>{a.name}</span>
                <span className="text-[#f59e0b] font-bold text-[10px]">{a.payout1m}%</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseAssetTab(a.id);
                  }}
                  className="p-0.5 text-slate-500 hover:text-white rounded hover:bg-white/10"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
        </div>

        {/* 30-Day Historical Range Indicator */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-400 pr-2">
          <span className="px-2 py-0.5 rounded bg-[#1b2232] border border-[#283348] text-slate-300 flex items-center gap-1.5 font-bold">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>30D History</span>
          </span>
          <button
            onClick={() => setPanOffset(Math.max(0, candles.length - visibleCount))}
            title="Pan to earliest 30 days ago"
            className="text-[10px] text-blue-400 hover:text-blue-300 underline font-semibold cursor-pointer"
          >
            30D Ago
          </button>
          <span>·</span>
          <button
            onClick={handleResetView}
            title="Jump to current live price"
            className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-semibold cursor-pointer"
          >
            Live Now
          </button>
        </div>
      </div>

      {/* Active Drawings Bar from Quotex Video (02:00 - 02:08) */}
      {drawings.length > 0 && (
        <div className="h-8 bg-[#10141f] border-b border-[#1f2638] px-3 flex items-center gap-1.5 overflow-x-auto scrollbar-none z-20">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <PenTool className="w-3 h-3 text-blue-400" />
            <span>Drawings ({drawings.length}):</span>
          </span>
          {drawings.map((d, index) => {
            const isSelected = selectedDrawingId === d.id;
            return (
              <div
                key={d.id}
                onClick={() => setSelectedDrawingId(d.id)}
                className={`h-6 px-2 rounded flex items-center gap-1.5 text-[10px] font-bold border transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1e273a] border-blue-500 text-white shadow-xs'
                    : 'bg-[#151a26] border-[#252e42] text-slate-300 hover:text-white hover:border-slate-500'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                <span className="uppercase tracking-wide">
                  {d.type} {d.labelIndex || index + 1}
                </span>

                {/* Clone button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const clone: DrawingItem = {
                      ...d,
                      id: 'draw_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                      price: d.price * 1.0015,
                      price2: d.price2 ? d.price2 * 1.0015 : undefined,
                      price3: d.price3 ? d.price3 * 1.0015 : undefined,
                      labelIndex: drawings.filter((item) => item.type === d.type).length + 1,
                    };
                    onAddDrawing(clone);
                  }}
                  title="Clone / Duplicate"
                  className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10"
                >
                  <Copy className="w-2.5 h-2.5" />
                </button>

                {/* Lock button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateDrawing({ ...d, locked: !d.locked });
                  }}
                  title={d.locked ? 'Unlock' : 'Lock'}
                  className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10"
                >
                  {d.locked ? <Lock className="w-2.5 h-2.5 text-amber-400" /> : <Unlock className="w-2.5 h-2.5" />}
                </button>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveDrawing(d.id);
                  }}
                  title="Delete Drawing"
                  className="p-0.5 text-slate-400 hover:text-red-400 rounded hover:bg-white/10"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
          <button
            onClick={onClearAllDrawings}
            title="Clear all drawings"
            className="text-[10px] text-red-400 hover:text-red-300 font-bold px-2 py-0.5 rounded hover:bg-red-500/10 transition-colors shrink-0 ml-1"
          >
            Clear All
          </button>
        </div>
      )}

      {/* 2. Sub-bar: Asset Title, UTC Clock, Candle Countdown, Pair Info (Matching Image 2) */}
      <div className="h-7 bg-[#121620] border-b border-[#1f2535] px-3 flex items-center justify-between z-10 text-xs">
        <div className="flex items-center gap-3">
          <div
            onClick={onOpenAssetModal}
            className="flex items-center gap-1.5 font-bold text-white cursor-pointer hover:text-blue-400 transition-colors"
          >
            <span>{asset.name}</span>
            <span className="text-amber-400 font-bold text-[11px]">{asset.payout1m}%</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>

          <div className="h-3 w-[1px] bg-[#2a3449]" />

          {/* Live UTC Clock with green dot matching Image 2 */}
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{utcTime}</span>
          </div>

          <div className="h-3 w-[1px] bg-[#2a3449]" />

          {/* Candle countdown timer */}
          <div className="flex items-center gap-1 font-mono text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            <CandlestickChart className="w-3 h-3 text-amber-400" />
            <span>00:{candleCountdown.toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Pair information button matching Image 2 */}
        <button
          onClick={() => setShowPairInfo(!showPairInfo)}
          className="flex items-center gap-1 text-[10px] font-bold text-[#0070f3] hover:text-[#38bdf8] transition-colors cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span>PAIR INFORMATION</span>
        </button>
      </div>

      {/* Pair Information Popup */}
      {showPairInfo && (
        <div className="absolute top-20 left-4 z-40 bg-[#181c27] border border-[#2a3449] rounded-xl shadow-2xl p-4 w-72 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between pb-1 border-b border-[#232938]">
            <span className="font-bold text-white text-sm">{asset.name}</span>
            <button onClick={() => setShowPairInfo(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Market Type:</span>
            <span className="font-bold text-white uppercase">OTC 24/7 Live</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Profit (1+ min):</span>
            <span className="font-bold text-[#00b074]">{asset.payout1m}%</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Profit (5+ min):</span>
            <span className="font-bold text-[#00b074]">{asset.payout5m}%</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>24h Change:</span>
            <span
              className={`font-bold ${
                asset.change24h >= 0 ? 'text-[#00b074]' : 'text-[#ff4757]'
              }`}
            >
              {asset.change24h >= 0 ? '+' : ''}
              {asset.change24h}%
            </span>
          </div>
        </div>
      )}

      {/* Active Drawing Tool Banner */}
      {activeDrawingTool && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-[#0070f3] text-white px-4 py-1.5 rounded-full shadow-lg text-xs font-bold flex items-center gap-2.5 animate-bounce">
          <PenTool className="w-3.5 h-3.5" />
          <span>
            {pendingAnchor
              ? `Click second point to finish ${activeDrawingTool}`
              : `Click chart to place ${activeDrawingTool}`}
          </span>
          <button
            onClick={() => {
              onClearDrawingTool();
              setPendingAnchor(null);
            }}
            className="bg-black/20 hover:bg-black/40 rounded-full p-0.5 ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Selected Drawing Settings Floating Bar ("sitting be nahi ha os ma" fixed!) */}
      {selectedDrawing && (
        <div className="absolute top-20 right-4 z-40 bg-[#181c27] border border-[#2a3449] rounded-xl shadow-2xl p-2.5 text-xs flex items-center gap-3 animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold text-white border-r border-[#242d40] pr-2.5">
            <PenTool className="w-3.5 h-3.5 text-[#0070f3]" />
            <span>{selectedDrawing.type}</span>
          </div>

          {/* Color pickers */}
          <div className="flex items-center gap-1">
            {colorOptions.map((c) => (
              <button
                key={c}
                onClick={() => onUpdateDrawing({ ...selectedDrawing, color: c })}
                className={`w-5 h-5 rounded-md transition-transform ${
                  selectedDrawing.color === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="h-4 w-[1px] bg-[#242d40]" />

          {/* Line thickness */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((w) => (
              <button
                key={w}
                onClick={() => onUpdateDrawing({ ...selectedDrawing, lineWidth: w })}
                className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] ${
                  selectedDrawing.lineWidth === w
                    ? 'bg-[#0070f3] text-white'
                    : 'bg-[#121620] text-slate-400 hover:text-white'
                }`}
              >
                {w}px
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-[#242d40]" />

          {/* Lock / Unlock */}
          <button
            onClick={() => onUpdateDrawing({ ...selectedDrawing, locked: !selectedDrawing.locked })}
            title={selectedDrawing.locked ? 'Unlock Drawing' : 'Lock Drawing'}
            className="p-1 rounded bg-[#121620] text-slate-300 hover:text-white"
          >
            {selectedDrawing.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          {/* Delete Drawing */}
          <button
            onClick={() => {
              onRemoveDrawing(selectedDrawing.id);
              setSelectedDrawingId(null);
            }}
            title="Delete this Drawing"
            className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Close Settings */}
          <button
            onClick={() => setSelectedDrawingId(null)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Main Interactive Canvas Element */}
      <div ref={containerRef} className={`flex-1 min-h-0 relative ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'} overflow-hidden`}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          className="w-full h-full block"
        />

        {/* Live Active Trades Dashboard Overlay (Shows live trades immediately on dashboard!) */}
        {activeTrades && activeTrades.length > 0 && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-[#121622]/95 backdrop-blur-md border border-[#252f44] rounded-2xl px-3.5 py-1.5 shadow-2xl animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 pr-2 border-r border-[#252f44]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-black tracking-wider text-white uppercase">
                Active Trade ({activeTrades.length})
              </span>
            </div>

            {activeTrades.map((trade) => {
              const isCall = trade.direction === 'call';
              const currentPrice = trade.currentPrice || trade.entryPrice;
              const isWinning = isCall
                ? currentPrice > trade.entryPrice
                : currentPrice < trade.entryPrice;
              const profitDisplay = isWinning
                ? `+$${trade.potentialProfit.toFixed(2)}`
                : `-$${trade.amount.toFixed(2)}`;

              return (
                <div key={trade.id} className="flex items-center gap-2.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                        isCall ? 'bg-emerald-500/20 text-[#00b074]' : 'bg-rose-500/20 text-[#ff4757]'
                      }`}
                    >
                      {isCall ? '▲ BUY' : '▼ SELL'}
                    </span>
                    <span className="text-white font-mono font-bold">{trade.amount} $</span>
                  </div>

                  <div className="font-mono text-[11px] text-slate-400">
                    Entry: <span className="text-slate-200 font-bold">{trade.entryPrice.toFixed(4)}</span>
                  </div>

                  {/* Live Profit/Loss indicator */}
                  <div
                    className={`px-2 py-0.5 rounded-md font-mono font-black text-[11px] ${
                      isWinning
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {profitDisplay}
                  </div>

                  {/* Countdown timer */}
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-400 border border-amber-400/30 font-mono font-black text-[11px]">
                    <Clock className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
                    <span>{trade.remainingSeconds}s</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quotex Live / Hovered Candle OHLC Stats Display (Matching Quotex Video at 00:36) */}
        {(() => {
          const displayCandle = hoveredCandle || (candles.length > 0 ? candles[candles.length - 1] : null);
          if (!displayCandle) return null;
          const isUp = displayCandle.close >= displayCandle.open;
          return (
            <div className="absolute left-3 bottom-12.5 z-20 flex flex-wrap items-center gap-2.5 text-[10.5px] font-mono pointer-events-none select-none bg-[#10141f]/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#232d40]/80 shadow-md">
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-medium">Open:</span>
                <span className="text-white font-bold">{displayCandle.open.toFixed(asset.decimals)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-medium">High:</span>
                <span className="text-emerald-400 font-bold">{displayCandle.high.toFixed(asset.decimals)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-medium">Low:</span>
                <span className="text-rose-400 font-bold">{displayCandle.low.toFixed(asset.decimals)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-medium">Close:</span>
                <span className={`font-bold ${isUp ? 'text-[#00b074]' : 'text-[#ff4757]'}`}>
                  {displayCandle.close.toFixed(asset.decimals)}
                </span>
              </div>
            </div>
          );
        })()}

        {/* 4. Bottom-Left Quotex Pro Chart Controls */}
        <div className="absolute left-3 bottom-3 flex items-center gap-1.5 z-30">
          {/* Timeframe Selector Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowTimeframeMenu(!showTimeframeMenu);
                setShowTypeMenu(false);
              }}
              className="h-8 px-2.5 rounded-lg bg-[#181c27] hover:bg-[#202738] border border-[#263145] text-white flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer shadow-md"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{timeframe}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showTimeframeMenu && (
              <div className="absolute bottom-10 left-0 bg-[#181c27] border border-[#2a3449] rounded-xl shadow-2xl p-1.5 grid grid-cols-3 gap-1 w-48 z-50 animate-in fade-in">
                {(['5s', '10s', '15s', '30s', '1m', '2m', '5m', '15m', '1h'] as Timeframe[]).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => {
                      onChangeTimeframe(tf);
                      setShowTimeframeMenu(false);
                    }}
                    className={`py-1.5 text-center text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      timeframe === tf
                        ? 'bg-[#0070f3] text-white'
                        : 'text-slate-300 hover:bg-[#202738] hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chart Type Selector Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowTypeMenu(!showTypeMenu);
                setShowTimeframeMenu(false);
              }}
              className="h-8 w-8 rounded-lg bg-[#181c27] hover:bg-[#202738] border border-[#263145] text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
              title="Chart Type"
            >
              {chartType === 'candles' && <CandlestickChart className="w-4 h-4 text-[#00b074]" />}
              {chartType === 'area' && <AreaChartIcon />}
              {chartType === 'bars' && <BarChart2 className="w-4 h-4 text-blue-400" />}
              {chartType === 'line' && <LineChart className="w-4 h-4 text-amber-400" />}
            </button>

            {showTypeMenu && (
              <div className="absolute bottom-10 left-0 bg-[#181c27] border border-[#2a3449] rounded-xl shadow-2xl p-1.5 w-36 space-y-1 z-50 animate-in fade-in">
                {[
                  { id: 'candles', name: 'Candles', icon: CandlestickChart },
                  { id: 'area', name: 'Area', icon: AreaChartIcon },
                  { id: 'bars', name: 'Bars', icon: BarChart2 },
                  { id: 'line', name: 'Line', icon: LineChart },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        onChangeChartType(t.id as ChartType);
                        setShowTypeMenu(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                        chartType === t.id
                          ? 'bg-[#0070f3] text-white'
                          : 'text-slate-300 hover:bg-[#202738] hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{t.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Indicators Launcher */}
          <button
            onClick={onOpenIndicators}
            className="h-8 px-2 rounded-lg bg-[#181c27] hover:bg-[#202738] border border-[#263145] text-white flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer shadow-md"
            title="Indicators"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-300" />
            {indicators.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#0070f3] text-white text-[9px] font-black flex items-center justify-center">
                {indicators.length}
              </span>
            )}
          </button>

          {/* Drawing Tools Launcher */}
          <button
            onClick={onOpenDrawingModal}
            className={`h-8 px-2 rounded-lg border text-white flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer shadow-md ${
              activeDrawingTool
                ? 'bg-[#0070f3] border-[#0070f3] text-white'
                : 'bg-[#181c27] hover:bg-[#202738] border-[#263145]'
            }`}
            title="Drawing Tools"
          >
            <PenTool className="w-3.5 h-3.5 text-slate-300" />
            {drawings.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#00b074] text-slate-950 text-[9px] font-black flex items-center justify-center">
                {drawings.length}
              </span>
            )}
          </button>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            className="h-8 w-8 rounded-lg bg-[#181c27] hover:bg-[#202738] border border-[#263145] text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
            title="Zoom In"
          >
            <Plus className="w-4 h-4 text-slate-300" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            className="h-8 w-8 rounded-lg bg-[#181c27] hover:bg-[#202738] border border-[#263145] text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4 text-slate-300" />
          </button>

          {/* Reset Zoom */}
          <button
            onClick={handleResetView}
            className="h-8 w-8 rounded-lg bg-[#181c27] hover:bg-[#202738] border border-[#263145] text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
            title="Reset View"
          >
            <Crosshair className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>

        {/* Jump to Live Market Button when panned back in history */}
        {panOffset > 2 && (
          <button
            onClick={() => setPanOffset(-8)}
            className="absolute bottom-13 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0070f3] hover:bg-[#0060d0] text-white text-xs font-bold shadow-xl transition-all cursor-pointer border border-blue-400/40 animate-in fade-in"
            title="Jump to live market"
          >
            <span>Live Market</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

function AreaChartIcon() {
  return (
    <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 20h18v-2H3v2zm0-4h18l-5-9-4 6-3-4-6 7z" />
    </svg>
  );
}
