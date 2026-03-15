import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResizableDivider } from "./ResizableDivider";
import { ActorList } from "./ActorList";
import { ElementList } from "./ElementList";
import type { Actor, ActorType, DiagramElement } from "@/lib/types";
import { PanelLeftCloseIcon, PanelLeftOpenIcon, PencilIcon, CheckIcon, XIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";

const ACTOR_PANEL_MIN_HEIGHT = 80;
const ACTOR_PANEL_DEFAULT_HEIGHT = 200;
const PANEL_HEIGHT_FALLBACK = 600;
const PANEL_RESERVED_SPACE = 130;

interface SidebarProps {
  width?: number;
  title: string;
  actors: Actor[];
  elements: DiagramElement[];
  onSetTitle: (title: string) => void;
  onAddActor: (name: string, type: ActorType, alias?: string) => void;
  onRemoveActor: (actorId: string) => void;
  onRenameActor: (actorId: string, name: string, alias?: string) => void;
  onReorderActor: (actorId: string, newIndex: number) => void;
  onUpdateActorType: (actorId: string, type: ActorType) => void;
  onRemoveElement: (elementId: string) => void;
  onReorderElement: (elementId: string, newIndex: number) => void;
  onUpdateElement: (element: DiagramElement) => void;
}

export function Sidebar({
  width = 256,
  title,
  actors,
  elements,
  onSetTitle,
  onAddActor,
  onRemoveActor,
  onRenameActor,
  onReorderActor,
  onUpdateActorType,
  onRemoveElement,
  onReorderElement,
  onUpdateElement,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [actorPanelHeight, setActorPanelHeight] = useState(
    ACTOR_PANEL_DEFAULT_HEIGHT
  );
  const panelRef = useRef<HTMLDivElement>(null);

  // Title editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState("");

  const handleActorPanelResize = useCallback((delta: number) => {
    setActorPanelHeight((h) => {
      const panelHeight = panelRef.current?.clientHeight ?? PANEL_HEIGHT_FALLBACK;
      // Reserve space for the two section headers and the elements section minimum
      const maxActorHeight = panelHeight - PANEL_RESERVED_SPACE;
      return Math.max(ACTOR_PANEL_MIN_HEIGHT, Math.min(maxActorHeight, h + delta));
    });
  }, []);

  const openTitleEdit = () => {
    setEditTitleValue(title);
    setEditingTitle(true);
  };

  const saveTitleEdit = () => {
    const trimmed = editTitleValue.trim();
    if (trimmed) {
      onSetTitle(trimmed);
    }
    setEditingTitle(false);
  };

  const cancelTitleEdit = () => {
    setEditingTitle(false);
  };

  return (
    <>
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-16 z-30 md:hidden h-8 w-8"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
      >
        {collapsed ? (
          <PanelLeftOpenIcon className="h-4 w-4" />
        ) : (
          <PanelLeftCloseIcon className="h-4 w-4" />
        )}
      </Button>

      {/* Overlay for mobile when sidebar is open */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar panel */}
      <div
        ref={panelRef}
        style={{ width }}
        className={`${
          collapsed ? "-translate-x-full" : "translate-x-0"
        } fixed z-20 flex h-[calc(100vh-3.5rem)] flex-col border-r bg-background transition-transform md:relative md:translate-x-0`}
      >
        {/* Title box */}
        <div className="shrink-0 border-b px-3 py-2">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Title
          </p>
          {editingTitle ? (
            <div className="flex items-center gap-1">
              <Input
                value={editTitleValue}
                onChange={(e) => setEditTitleValue(e.target.value)}
                autoFocus
                className="h-7 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitleEdit();
                  if (e.key === "Escape") cancelTitleEdit();
                }}
              />
              <button
                className="rounded p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={saveTitleEdit}
                aria-label="Save title"
              >
                <CheckIcon className="h-3.5 w-3.5" />
              </button>
              <button
                className="rounded p-0.5 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={cancelTitleEdit}
                aria-label="Cancel title edit"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="group flex items-center gap-1.5">
              <span className="flex-1 truncate text-sm font-medium">{title}</span>
              <button
                className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
                onClick={openTitleEdit}
                aria-label="Edit title"
              >
                <PencilIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between p-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Actors</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 md:hidden"
            onClick={() => setCollapsed(true)}
            aria-label="Close sidebar"
          >
            <PanelLeftCloseIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div style={{ height: actorPanelHeight }} className="shrink-0 overflow-hidden">
          <ScrollArea className="h-full">
            <ActorList
              actors={actors}
              onAddActor={onAddActor}
              onRemoveActor={onRemoveActor}
              onRenameActor={onRenameActor}
              onReorderActor={onReorderActor}
              onUpdateActorType={onUpdateActorType}
            />
          </ScrollArea>
        </div>
        <ResizableDivider orientation="horizontal" onResize={handleActorPanelResize} />
        <div className="shrink-0 p-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Elements</h2>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <ElementList
              elements={elements}
              actors={actors}
              onRemoveElement={onRemoveElement}
              onReorderElement={onReorderElement}
              onUpdateElement={onUpdateElement}
            />
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
