import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ActorList } from "./ActorList";
import { ElementList } from "./ElementList";
import type { Actor, ActorType, DiagramElement } from "@/lib/types";

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
  return (
    <div className="flex h-full w-64 flex-col border-r">
      <div className="flex-1 overflow-hidden">
        <div className="p-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Actors</h2>
        </div>
        <ScrollArea className="h-[calc(50%-24px)]">
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
      <Separator />
      <div className="flex-1 overflow-hidden">
        <div className="p-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Elements</h2>
        </div>
        <ScrollArea className="h-[calc(50%-24px)]">
          <ElementList
            elements={elements}
            actors={actors}
            onRemoveElement={onRemoveElement}
            onReorderElement={onReorderElement}
          />
        </ScrollArea>
      </div>
    </div>
  );
}
