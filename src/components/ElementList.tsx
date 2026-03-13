import { useState } from "react";
import type { Actor, DiagramElement, ArrowType } from "@/lib/types";
import {
  Trash2Icon,
  GripVerticalIcon,
} from "lucide-react";

interface ElementListProps {
  elements: DiagramElement[];
  actors: Actor[];
  onRemoveElement: (elementId: string) => void;
  onReorderElement: (elementId: string, newIndex: number) => void;
}

const arrowSymbols: Record<ArrowType, string> = {
  "->>": "→→",
  "->": "→",
  "-->>": "⇢⇢",
  "-->": "⇢",
  "-x": "→✕",
  "--x": "⇢✕",
  "-)": "→)",
  "--)": "⇢)",
};

function getActorName(actors: Actor[], actorId: string): string {
  const actor = actors.find((a) => a.id === actorId);
  return actor?.name || actorId;
}

function getElementSummary(element: DiagramElement, actors: Actor[]): string {
  switch (element.kind) {
    case "message": {
      const from = getActorName(actors, element.from);
      const to = getActorName(actors, element.to);
      const arrow = arrowSymbols[element.arrowType] || element.arrowType;
      return `${from} ${arrow} ${to}: ${element.label}`;
    }
    case "activation":
      return `${element.type} ${getActorName(actors, element.actorId)}`;
    case "note": {
      const actorNames = element.actorIds
        .map((id) => getActorName(actors, id))
        .join(", ");
      return `Note ${element.position} ${actorNames}: ${element.text}`;
    }
  }
}

function getElementBadge(element: DiagramElement): { label: string; className: string } {
  switch (element.kind) {
    case "message":
      return { label: "msg", className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" };
    case "activation":
      return { label: element.type === "activate" ? "act" : "deact", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" };
    case "note":
      return { label: "note", className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" };
  }
}

export function ElementList({
  elements,
  actors,
  onRemoveElement,
  onReorderElement,
}: ElementListProps) {
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOverElementId, setDragOverElementId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    setDraggedElementId(elementId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, elementId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (elementId !== draggedElementId) {
      setDragOverElementId(elementId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const related = e.relatedTarget as Node | null;
    if (!related || !e.currentTarget.contains(related)) {
      setDragOverElementId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetElementId: string) => {
    e.preventDefault();
    if (draggedElementId && draggedElementId !== targetElementId) {
      const newIndex = elements.findIndex((el) => el.id === targetElementId);
      onReorderElement(draggedElementId, newIndex);
    }
    setDraggedElementId(null);
    setDragOverElementId(null);
  };

  const handleDragEnd = () => {
    setDraggedElementId(null);
    setDragOverElementId(null);
  };

  if (elements.length === 0) {
    return (
      <div className="p-3 pt-0">
        <p className="text-sm text-muted-foreground">No elements added yet.</p>
      </div>
    );
  }

  return (
    <div className="p-3 pt-0">
      <div className="space-y-1">
        {elements.map((element, index) => {
          const badge = getElementBadge(element);
          const summary = getElementSummary(element, actors);
          return (
            <div
              key={element.id}
              draggable
              onDragStart={(e) => handleDragStart(e, element.id)}
              onDragOver={(e) => handleDragOver(e, element.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, element.id)}
              onDragEnd={handleDragEnd}
              className={`group flex items-center gap-1.5 rounded-md px-2 py-1 transition-opacity ${
                draggedElementId === element.id
                  ? "opacity-40"
                  : dragOverElementId === element.id
                    ? "bg-accent"
                    : "hover:bg-muted"
              }`}
            >
              {/* Drag handle */}
              <GripVerticalIcon
                className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/40 hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
                role="button"
                tabIndex={0}
                aria-label={`Reorder element: ${summary}. Use arrow keys to move.`}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    if (index > 0) onReorderElement(element.id, index - 1);
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    if (index < elements.length - 1) onReorderElement(element.id, index + 1);
                  }
                }}
              />

              {/* Type badge */}
              <span
                className={`shrink-0 rounded px-1 py-0.5 text-[10px] font-medium leading-none ${badge.className}`}
              >
                {badge.label}
              </span>

              {/* Summary */}
              <div className="min-w-0 flex-1 truncate text-sm">
                {summary}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <button
                  className="rounded p-0.5 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => onRemoveElement(element.id)}
                  aria-label={`Remove element: ${summary}`}
                >
                  <Trash2Icon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
