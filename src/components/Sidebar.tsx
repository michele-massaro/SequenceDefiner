import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ActorList } from "./ActorList";
import { ElementList } from "./ElementList";

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col border-r">
      <div className="flex-1 overflow-hidden">
        <div className="p-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Actors</h2>
        </div>
        <ScrollArea className="h-[calc(50%-24px)]">
          <ActorList />
        </ScrollArea>
      </div>
      <Separator />
      <div className="flex-1 overflow-hidden">
        <div className="p-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Elements</h2>
        </div>
        <ScrollArea className="h-[calc(50%-24px)]">
          <ElementList />
        </ScrollArea>
      </div>
    </div>
  );
}
