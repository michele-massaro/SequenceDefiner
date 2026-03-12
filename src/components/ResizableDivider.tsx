import { useCallback } from "react";
import { cn } from "@/lib/utils";

interface ResizableDividerProps {
  onResize: (delta: number) => void;
  orientation: "horizontal" | "vertical";
  className?: string;
}

export function ResizableDivider({
  onResize,
  orientation,
  className,
}: ResizableDividerProps) {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      // Drag axis is perpendicular to the bar's visual orientation
      let lastPos = orientation === "vertical" ? e.clientX : e.clientY;

      const handleMouseMove = (e: MouseEvent) => {
        const pos = orientation === "vertical" ? e.clientX : e.clientY;
        const delta = pos - lastPos;
        lastPos = pos;
        onResize(delta);
      };

      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [onResize, orientation]
  );

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "group relative flex shrink-0 select-none items-center justify-center bg-border transition-colors hover:bg-primary/20 active:bg-primary/40",
        orientation === "vertical"
          ? "w-1 cursor-col-resize"
          : "h-1 cursor-row-resize",
        className
      )}
      onMouseDown={handleMouseDown}
    >
      <div
        className={cn(
          "rounded-full bg-muted-foreground/40 transition-all group-hover:bg-primary/60 group-active:bg-primary",
          orientation === "vertical" ? "h-8 w-0.5" : "h-0.5 w-8"
        )}
      />
    </div>
  );
}
