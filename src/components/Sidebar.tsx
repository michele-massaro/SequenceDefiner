import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ActorList } from "./ActorList";
import { ElementList } from "./ElementList";
import type { Actor, ActorType, DiagramElement } from "@/lib/types";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  actors: Actor[];
  elements: DiagramElement[];
  onAddActor: (name: string, type: ActorType, alias?: string) => void;
  onRemoveActor: (actorId: string) => void;
  onRenameActor: (actorId: string, name: string, alias?: string) => void;
  onReorderActor: (actorId: string, newIndex: number) => void;
  onUpdateActorType: (actorId: string, type: ActorType) => void;
  onRemoveElement: (elementId: string) => void;
  onReorderElement: (elementId: string, newIndex: number) => void;
}

export function Sidebar({
  actors,
  elements,
  onAddActor,
  onRemoveActor,
  onRenameActor,
  onReorderActor,
  onUpdateActorType,
  onRemoveElement,
  onReorderElement,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

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
        className={`${
          collapsed ? "-translate-x-full" : "translate-x-0"
        } fixed z-20 flex h-[calc(100vh-3.5rem)] w-64 flex-col border-r bg-background transition-transform md:relative md:translate-x-0`}
      >
        <div className="flex items-center justify-between p-3">
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
        <ScrollArea className="flex-1">
          <ActorList
            actors={actors}
            onAddActor={onAddActor}
            onRemoveActor={onRemoveActor}
            onRenameActor={onRenameActor}
            onReorderActor={onReorderActor}
            onUpdateActorType={onUpdateActorType}
          />
        </ScrollArea>
        <Separator />
        <div className="p-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Elements</h2>
        </div>
        <ScrollArea className="flex-1">
          <ElementList
            elements={elements}
            actors={actors}
            onRemoveElement={onRemoveElement}
            onReorderElement={onReorderElement}
          />
        </ScrollArea>
      </div>
    </>
  );
}
