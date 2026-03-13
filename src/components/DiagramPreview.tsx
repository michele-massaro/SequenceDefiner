import { useRef } from "react";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  HomeIcon,
  LoaderCircleIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDiagramPanZoom } from "@/hooks/useDiagramPanZoom";

interface DiagramPreviewProps {
  svg: string;
  error: string | null;
  isRendering?: boolean;
}

export function DiagramPreview({ svg, error, isRendering }: DiagramPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panZoom = useDiagramPanZoom(containerRef);

  const controlButtonClass =
    "size-7 rounded-md bg-background/80 backdrop-blur-sm border border-border shadow-sm hover:bg-muted";

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex h-full items-center justify-center p-4">
          <p className="text-sm text-destructive">
            Failed to render diagram: {error}
          </p>
        </div>
      );
    }

    if (!svg && isRendering) {
      return (
        <div className="flex h-full items-center justify-center">
          <LoaderCircleIcon className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="sr-only">Rendering diagram...</span>
        </div>
      );
    }

    if (!svg) {
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Diagram preview will appear here.
          </p>
        </div>
      );
    }

    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: panZoom.cssTransform,
          transformOrigin: "center center",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden bg-muted/30 cursor-grab active:cursor-grabbing"
      onMouseDown={panZoom.handleMouseDown}
      onMouseMove={panZoom.handleMouseMove}
      onMouseUp={panZoom.handleMouseUp}
      onMouseLeave={panZoom.handleMouseUp}
      onTouchStart={panZoom.handleTouchStart}
      onTouchMove={panZoom.handleTouchMove}
      onTouchEnd={panZoom.handleTouchEnd}
    >
      {renderContent()}

      {/* Rendering indicator (shown while an updated diagram is being rendered) */}
      {isRendering && svg && (
        <div className="absolute right-3 top-3 z-10">
          <LoaderCircleIcon className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Controls overlay */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col items-center gap-1 select-none">
        {/* Arrow pad */}
        <div className="grid grid-cols-3 gap-1">
          <div />
          <Button
            variant="outline"
            size="icon"
            className={controlButtonClass}
            onClick={panZoom.panUp}
            title="Pan up"
          >
            <ArrowUpIcon />
          </Button>
          <div />
          <Button
            variant="outline"
            size="icon"
            className={controlButtonClass}
            onClick={panZoom.panLeft}
            title="Pan left"
          >
            <ArrowLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={controlButtonClass}
            onClick={panZoom.reset}
            title="Reset view"
          >
            <HomeIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={controlButtonClass}
            onClick={panZoom.panRight}
            title="Pan right"
          >
            <ArrowRightIcon />
          </Button>
          <div />
          <Button
            variant="outline"
            size="icon"
            className={controlButtonClass}
            onClick={panZoom.panDown}
            title="Pan down"
          >
            <ArrowDownIcon />
          </Button>
          <div />
        </div>
        {/* Zoom buttons */}
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className={controlButtonClass}
            onClick={panZoom.zoomOut}
            title="Zoom out"
          >
            <ZoomOutIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={controlButtonClass}
            onClick={panZoom.zoomIn}
            title="Zoom in"
          >
            <ZoomInIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
