import { useCallback, useEffect, useRef, useState } from "react";

const ZOOM_FACTOR = 0.15;
const ZOOM_STEP_BUTTON = 0.25;
const PAN_STEP = 60;
const MIN_SCALE = 0.1;
const MAX_SCALE = 5;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

interface PanZoomState {
  scale: number;
  offset: { x: number; y: number };
}

interface TouchStartInfo {
  scale: number;
  offset: { x: number; y: number };
  distance: number;
  centerX: number;
  centerY: number;
}

export function useDiagramPanZoom(
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  // Use refs for current values to avoid stale closures in event handlers
  const stateRef = useRef<PanZoomState>({ scale: 1, offset: { x: 0, y: 0 } });
  const [renderState, setRenderState] = useState<PanZoomState>({
    scale: 1,
    offset: { x: 0, y: 0 },
  });

  const isDragging = useRef(false);
  const lastPointerPos = useRef({ x: 0, y: 0 });
  const touchStartInfo = useRef<TouchStartInfo | null>(null);

  const applyState = useCallback((scale: number, offset: { x: number; y: number }) => {
    stateRef.current = { scale, offset };
    setRenderState({ scale, offset });
  }, []);

  const getContainerCenter = useCallback((): { cx: number; cy: number } => {
    if (!containerRef.current) return { cx: 0, cy: 0 };
    return {
      cx: containerRef.current.clientWidth / 2,
      cy: containerRef.current.clientHeight / 2,
    };
  }, [containerRef]);

  /** Zoom at a specific point in container coordinates */
  const zoomAt = useCallback(
    (mx: number, my: number, newScale: number) => {
      const { scale, offset } = stateRef.current;
      const { cx, cy } = getContainerCenter();
      const clamped = clamp(newScale, MIN_SCALE, MAX_SCALE);
      const ratio = clamped / scale;
      // Keep the point at (mx, my) fixed in screen space
      const rx = mx - cx;
      const ry = my - cy;
      applyState(clamped, {
        x: rx * (1 - ratio) + offset.x * ratio,
        y: ry * (1 - ratio) + offset.y * ratio,
      });
    },
    [applyState, getContainerCenter]
  );

  const reset = useCallback(() => {
    applyState(1, { x: 0, y: 0 });
  }, [applyState]);

  const zoomIn = useCallback(() => {
    const { scale, offset } = stateRef.current;
    const newScale = clamp(scale + ZOOM_STEP_BUTTON, MIN_SCALE, MAX_SCALE);
    const ratio = newScale / scale;
    applyState(newScale, { x: offset.x * ratio, y: offset.y * ratio });
  }, [applyState]);

  const zoomOut = useCallback(() => {
    const { scale, offset } = stateRef.current;
    const newScale = clamp(scale - ZOOM_STEP_BUTTON, MIN_SCALE, MAX_SCALE);
    const ratio = newScale / scale;
    applyState(newScale, { x: offset.x * ratio, y: offset.y * ratio });
  }, [applyState]);

  const panUp = useCallback(() => {
    const { scale, offset } = stateRef.current;
    applyState(scale, { x: offset.x, y: offset.y - PAN_STEP });
  }, [applyState]);

  const panDown = useCallback(() => {
    const { scale, offset } = stateRef.current;
    applyState(scale, { x: offset.x, y: offset.y + PAN_STEP });
  }, [applyState]);

  const panLeft = useCallback(() => {
    const { scale, offset } = stateRef.current;
    applyState(scale, { x: offset.x - PAN_STEP, y: offset.y });
  }, [applyState]);

  const panRight = useCallback(() => {
    const { scale, offset } = stateRef.current;
    applyState(scale, { x: offset.x + PAN_STEP, y: offset.y });
  }, [applyState]);

  // Wheel handler — attached via addEventListener to allow passive: false
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const { scale } = stateRef.current;
      const delta = e.deltaY < 0 ? ZOOM_FACTOR : -ZOOM_FACTOR;
      const newScale = clamp(scale * (1 + delta), MIN_SCALE, MAX_SCALE);
      zoomAt(mx, my, newScale);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [containerRef, zoomAt]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    lastPointerPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastPointerPos.current.x;
      const dy = e.clientY - lastPointerPos.current.y;
      lastPointerPos.current = { x: e.clientX, y: e.clientY };
      const { scale, offset } = stateRef.current;
      applyState(scale, { x: offset.x + dx, y: offset.y + dy });
    },
    [applyState]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      lastPointerPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.touches.length === 2) {
      isDragging.current = false;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const { scale, offset } = stateRef.current;
      touchStartInfo.current = {
        scale,
        offset: { ...offset },
        distance: Math.hypot(
          t2.clientX - t1.clientX,
          t2.clientY - t1.clientY
        ),
        centerX: (t1.clientX + t2.clientX) / 2,
        centerY: (t1.clientY + t2.clientY) / 2,
      };
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      if (e.touches.length === 1 && isDragging.current) {
        const dx = e.touches[0].clientX - lastPointerPos.current.x;
        const dy = e.touches[0].clientY - lastPointerPos.current.y;
        lastPointerPos.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        const { scale, offset } = stateRef.current;
        applyState(scale, { x: offset.x + dx, y: offset.y + dy });
      } else if (e.touches.length === 2 && touchStartInfo.current) {
        const info = touchStartInfo.current;
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const newDist = Math.hypot(
          t2.clientX - t1.clientX,
          t2.clientY - t1.clientY
        );
        const pinchRatio = newDist / info.distance;
        const newScale = clamp(info.scale * pinchRatio, MIN_SCALE, MAX_SCALE);
        const actualRatio = newScale / info.scale;

        const rect = container.getBoundingClientRect();
        const { cx, cy } = getContainerCenter();
        // Start center in container coords
        const startRx = info.centerX - rect.left - cx;
        const startRy = info.centerY - rect.top - cy;
        // Current center in container coords
        const newCenterRx = (t1.clientX + t2.clientX) / 2 - rect.left - cx;
        const newCenterRy = (t1.clientY + t2.clientY) / 2 - rect.top - cy;

        applyState(newScale, {
          x: newCenterRx + (info.offset.x - startRx) * actualRatio,
          y: newCenterRy + (info.offset.y - startRy) * actualRatio,
        });
      }
    },
    [applyState, containerRef, getContainerCenter]
  );

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    touchStartInfo.current = null;
  }, []);

  const { scale, offset } = renderState;

  // CSS transform: translate(tx, ty) scale(scale) with transform-origin: center center
  // The translation (offset) is in screen pixels; scale is centered on container center
  const cssTransform = `translate(${offset.x}px, ${offset.y}px) scale(${scale})`;

  return {
    scale,
    offset,
    cssTransform,
    reset,
    zoomIn,
    zoomOut,
    panUp,
    panDown,
    panLeft,
    panRight,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
