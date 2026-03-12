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
import { MenuIcon, FilePlusIcon, UploadIcon, DownloadIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface TopBarProps {
  mermaidCode: string;
  onNewSession: () => void;
  onImport: (state: DiagramState) => void;
}

export function TopBar({ mermaidCode, onNewSession, onImport }: TopBarProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
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

  return (
    <div className="flex h-14 items-center justify-between border-b px-4">
      <h1 className="text-lg font-semibold">SequenceDefiner</h1>
      <div className="flex items-center gap-2">
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
    </div>
  );
}
