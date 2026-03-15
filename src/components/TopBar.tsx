import { useCallback, useRef, useState } from "react";
import { parse } from "@/lib/mermaid-parser";
import type { DiagramState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MenuIcon, FilePlusIcon, UploadIcon, DownloadIcon, ImageIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { APP_VERSION } from "@/lib/version";

type ImageFormat = "png" | "svg";
type ImageBackground = "white" | "transparent";

interface TopBarProps {
  mermaidCode: string;
  svg: string;
  onNewSession: () => void;
  onImport: (state: DiagramState) => void;
}

export function TopBar({ mermaidCode, svg, onNewSession, onImport }: TopBarProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [exportImageOpen, setExportImageOpen] = useState(false);
  const [imageFormat, setImageFormat] = useState<ImageFormat>("png");
  const [imageBg, setImageBg] = useState<ImageBackground>("white");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNewSession = useCallback(() => {
    onNewSession();
    setConfirmOpen(false);
  }, [onNewSession]);

  const handleExport = useCallback(() => {
    const blob = new Blob([mermaidCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sequence-diagram.mmd";
    a.click();
    URL.revokeObjectURL(url);
  }, [mermaidCode]);

  const handleFileSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        try {
          const state = parse(text);
          if (state.actors.length === 0 && state.elements.length === 0) {
            setImportError(
              "The file could not be parsed. No actors or elements were found. Please check that the file contains valid Mermaid sequence diagram syntax."
            );
            return;
          }
          onImport(state);
        } catch {
          setImportError(
            "Failed to parse the imported file. Please ensure it contains valid Mermaid sequence diagram syntax."
          );
        }
      };
      reader.onerror = () => {
        setImportError("Failed to read the file. Please try again.");
      };
      reader.readAsText(file);

      // Reset input so the same file can be re-imported
      e.target.value = "";
    },
    [onImport]
  );

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleExportImage = useCallback(() => {
    if (!svg) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, "image/svg+xml");
    const svgEl = doc.documentElement as unknown as SVGSVGElement;

    if (!svgEl.getAttribute("xmlns")) {
      svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }

    if (imageFormat === "svg") {
      if (imageBg === "white") {
        const rect = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("width", "100%");
        rect.setAttribute("height", "100%");
        rect.setAttribute("fill", "white");
        svgEl.insertBefore(rect, svgEl.firstChild);
      }
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgEl);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sequence-diagram.svg";
      a.click();
      URL.revokeObjectURL(url);
      setExportImageOpen(false);
    } else {
      // Determine SVG dimensions from viewBox or width/height attributes
      let width = 800;
      let height = 600;
      const viewBox = svgEl.getAttribute("viewBox");
      if (viewBox) {
        const parts = viewBox.split(/[\s,]+/);
        if (parts.length === 4) {
          width = parseFloat(parts[2]) || 800;
          height = parseFloat(parts[3]) || 600;
        }
      } else {
        const w = svgEl.getAttribute("width");
        const h = svgEl.getAttribute("height");
        if (w && !w.includes("%")) width = parseFloat(w) || 800;
        if (h && !h.includes("%")) height = parseFloat(h) || 600;
      }

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgEl);
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        const scale = 2; // 2× for retina-quality output
        const canvas = document.createElement("canvas");
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          return;
        }
        ctx.scale(scale, scale);
        if (imageBg === "white") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
        }
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        canvas.toBlob((pngBlob) => {
          if (!pngBlob) return;
          const pngUrl = URL.createObjectURL(pngBlob);
          const a = document.createElement("a");
          a.href = pngUrl;
          a.download = "sequence-diagram.png";
          a.click();
          URL.revokeObjectURL(pngUrl);
          setExportImageOpen(false);
        }, "image/png");
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  }, [svg, imageFormat, imageBg]);

  return (
    <div className="flex h-14 items-center justify-between border-b px-4">
      <h1 className="text-lg font-semibold">SequenceDefiner</h1>
      <div className="flex items-center gap-2">
        <span className="select-none text-xs font-medium text-muted-foreground">
          v{APP_VERSION}
        </span>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline" size="icon" />}
          >
            <MenuIcon />
            <span className="sr-only">Menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setConfirmOpen(true)}>
              <FilePlusIcon />
              New Session
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleImportClick}>
              <UploadIcon />
              Import File
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExport}>
              <DownloadIcon />
              Export File
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setExportImageOpen(true)}
              disabled={!svg}
            >
              <ImageIcon />
              Export Image
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <input
          ref={fileInputRef}
          type="file"
          accept=".mmd,.txt"
          className="hidden"
          onChange={handleFileSelected}
        />
      </div>

      {/* New Session confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to start a new session? All current diagram
              data will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleNewSession}>
              Clear & Start New
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import error dialog */}
      <Dialog
        open={importError !== null}
        onOpenChange={(open) => {
          if (!open) setImportError(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Error</DialogTitle>
            <DialogDescription>{importError}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setImportError(null)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Image dialog */}
      <Dialog open={exportImageOpen} onOpenChange={setExportImageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Image</DialogTitle>
            <DialogDescription>
              Choose the format and background for the exported image.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Format selector */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Format</span>
              <div className="flex gap-2">
                {(["png", "svg"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setImageFormat(fmt)}
                    className={cn(
                      "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      imageFormat === fmt
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background text-foreground hover:bg-muted"
                    )}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Background selector */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Background</span>
              <div className="flex gap-2">
                {(["white", "transparent"] as const).map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setImageBg(bg)}
                    className={cn(
                      "flex flex-1 items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      imageBg === bg
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background text-foreground hover:bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 shrink-0 rounded-sm border",
                        bg === "white"
                          ? "bg-white border-border"
                          : "border-border"
                      )}
                      style={
                        bg === "transparent"
                          ? {
                              background:
                                "repeating-conic-gradient(#aaa 0% 25%, #fff 0% 50%) 0 0 / 8px 8px",
                            }
                          : undefined
                      }
                    />
                    {bg.charAt(0).toUpperCase() + bg.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExportImageOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleExportImage}>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
