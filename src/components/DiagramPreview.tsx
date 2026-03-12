import { ScrollArea } from "@/components/ui/scroll-area";
import { LoaderCircleIcon } from "lucide-react";

interface DiagramPreviewProps {
  svg: string;
  error: string | null;
  isRendering?: boolean;
}

export function DiagramPreview({ svg, error, isRendering }: DiagramPreviewProps) {
  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center bg-muted/30 p-4">
        <p className="text-sm text-destructive">
          Failed to render diagram: {error}
        </p>
      </div>
    );
  }

  if (!svg && isRendering) {
    return (
      <div className="flex flex-1 items-center justify-center bg-muted/30">
        <LoaderCircleIcon className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="sr-only">Rendering diagram...</span>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="flex flex-1 items-center justify-center bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Diagram preview will appear here.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 bg-muted/30">
      <div className="relative flex min-h-full items-center justify-center p-4">
        {isRendering && (
          <div className="absolute right-3 top-3">
            <LoaderCircleIcon className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      </div>
    </ScrollArea>
  );
}
