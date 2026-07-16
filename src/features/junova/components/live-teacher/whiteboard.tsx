'use client';

/**
 * StudentOS Junova AI — Whiteboard Foundation
 *
 * A canvas-based whiteboard with basic drawing capabilities. This is the
 * foundation for future "Live AI Teacher" whiteboard features (e.g., AI
 * draws diagrams, student annotates).
 *
 * Current capabilities:
 * - Free-hand drawing (mouse + touch)
 * - Clear canvas
 * - Color selection
 * - Stroke width
 *
 * Future capabilities (not yet implemented):
 * - AI-generated diagrams
 * - Multi-user collaboration
 * - Shape recognition
 * - Save/export
 */

import { useRef, useState, useEffect, useCallback, type MouseEvent, type TouchEvent } from 'react';
import { Eraser, Pencil, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface WhiteboardProps {
  className?: string;
  /** Whether the whiteboard is read-only (AI drawing only). */
  readOnly?: boolean;
}

type Tool = 'pencil' | 'eraser';

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ffffff'];

export function Whiteboard({ className, readOnly = false }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const [tool, setTool] = useState<Tool>('pencil');
  const [color, setColor] = useState(COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState(3);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match display size
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    resize();
    ctxRef.current = ctx;

    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getPoint = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }

    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = useCallback(
    (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
      if (readOnly) return;
      e.preventDefault();
      isDrawingRef.current = true;
      lastPointRef.current = getPoint(e);
    },
    [readOnly],
  );

  const draw = useCallback(
    (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || !ctxRef.current || readOnly) return;
      e.preventDefault();

      const point = getPoint(e);
      const ctx = ctxRef.current;
      const last = lastPointRef.current;

      if (last) {
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(point.x, point.y);
        ctx.strokeStyle = tool === 'eraser' ? '#0a0a14' : color;
        ctx.lineWidth = tool === 'eraser' ? strokeWidth * 3 : strokeWidth;
        ctx.stroke();
      }

      lastPointRef.current = point;
    },
    [color, strokeWidth, tool, readOnly],
  );

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    toast.success('Whiteboard cleared');
  }, []);

  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `studentos-whiteboard-${Date.now()}.png`;
    a.click();
    toast.success('Whiteboard saved');
  }, []);

  return (
    <div className={cn('border-border bg-card/50 flex flex-col rounded-xl border', className)}>
      {/* Toolbar */}
      {!readOnly && (
        <div className="border-border flex flex-wrap items-center gap-2 border-b p-2">
          {/* Tools */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={tool === 'pencil' ? 'default' : 'ghost'}
              onClick={() => setTool('pencil')}
              className="h-8 w-8 p-0"
              aria-label="Pencil"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={tool === 'eraser' ? 'default' : 'ghost'}
              onClick={() => setTool('eraser')}
              className="h-8 w-8 p-0"
              aria-label="Eraser"
            >
              <Eraser className="h-4 w-4" />
            </Button>
          </div>

          {/* Colors */}
          <div className="flex gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setTool('pencil');
                }}
                className={cn(
                  'ring-offset-background h-6 w-6 rounded-full ring-2 ring-offset-2 transition-all',
                  color === c && tool === 'pencil' ? 'ring-foreground' : 'ring-transparent',
                )}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>

          {/* Stroke width */}
          <input
            type="range"
            min={1}
            max={10}
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-20"
            aria-label="Stroke width"
          />

          {/* Actions */}
          <div className="ml-auto flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={downloadCanvas}
              className="h-8 w-8 p-0"
              aria-label="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearCanvas}
              className="text-destructive h-8 w-8 p-0"
              aria-label="Clear"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="flex-1 cursor-crosshair touch-none"
        style={{ minHeight: '300px' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </div>
  );
}
