import { ScrollArea } from "@/components/ui/scroll-area";

interface DiagramPreviewProps {
  svg: string;
  error: string | null;
}

export function DiagramPreview({ svg, error }: DiagramPreviewProps) {
  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center bg-muted/30 p-4">
        <p className="text-sm text-destructive">
          Failed to render diagram: {error}
        </p>
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
      <div
        className="flex min-h-full items-center justify-center p-4"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </ScrollArea>
  );
}
