import { useMemo, useState } from "react";
import type { Actor, DiagramElement, ArrowType } from "@/lib/types";
import {
  Trash2Icon,
  GripVerticalIcon,
  PencilIcon,
  ArrowLeftRightIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ElementListProps {
  elements: DiagramElement[];
  actors: Actor[];
  onRemoveElement: (elementId: string) => void;
  onReorderElement: (elementId: string, newIndex: number) => void;
  onUpdateElement: (element: DiagramElement) => void;
}

const ARROW_TYPES: { value: ArrowType; label: string }[] = [
  { value: "->>", label: "Solid line" },
  { value: "->", label: "Solid open" },
  { value: "-->>", label: "Dotted line" },
  { value: "-->", label: "Dotted open" },
  { value: "-x", label: "Solid cross" },
  { value: "--x", label: "Dotted cross" },
  { value: "-)", label: "Solid async" },
  { value: "--)", label: "Dotted async" },
];

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
  onUpdateElement,
}: ElementListProps) {
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOverElementId, setDragOverElementId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<DiagramElement | null>(null);

  // --- Edit form state ---
  // Message
  const [editMsgFrom, setEditMsgFrom] = useState("");
  const [editMsgTo, setEditMsgTo] = useState("");
  const [editMsgLabel, setEditMsgLabel] = useState("");
  const [editMsgArrowType, setEditMsgArrowType] = useState<ArrowType>("->>");
  // Activation
  const [editActActorId, setEditActActorId] = useState("");
  const [editActType, setEditActType] = useState<"activate" | "deactivate">("activate");
  // Note
  const [editNotePosition, setEditNotePosition] = useState<"left of" | "right of" | "over">("right of");
  const [editNoteActorId, setEditNoteActorId] = useState("");
  const [editNoteActorId2, setEditNoteActorId2] = useState("");
  const [editNoteText, setEditNoteText] = useState("");

  const actorItems = useMemo(
    () => actors.map((a) => ({ value: a.id, label: a.name })),
    [actors]
  );

  const noteActorItems2 = useMemo(
    () => [
      { value: "", label: "None" },
      ...actors
        .filter((a) => a.id !== editNoteActorId)
        .map((a) => ({ value: a.id, label: a.name })),
    ],
    [actors, editNoteActorId]
  );

  const openEditDialog = (element: DiagramElement) => {
    setEditTarget(element);
    if (element.kind === "message") {
      setEditMsgFrom(element.from);
      setEditMsgTo(element.to);
      setEditMsgLabel(element.label);
      setEditMsgArrowType(element.arrowType);
    } else if (element.kind === "activation") {
      setEditActActorId(element.actorId);
      setEditActType(element.type);
    } else if (element.kind === "note") {
      setEditNotePosition(element.position);
      setEditNoteActorId(element.actorIds[0] ?? "");
      setEditNoteActorId2(element.actorIds[1] ?? "");
      setEditNoteText(element.text);
    }
  };

  const closeEditDialog = () => setEditTarget(null);

  const handleSaveEdit = () => {
    if (!editTarget) return;
    let updated: DiagramElement;
    if (editTarget.kind === "message") {
      if (!editMsgFrom || !editMsgTo || !editMsgLabel.trim()) return;
      updated = {
        ...editTarget,
        from: editMsgFrom,
        to: editMsgTo,
        label: editMsgLabel.trim(),
        arrowType: editMsgArrowType,
      };
    } else if (editTarget.kind === "activation") {
      if (!editActActorId) return;
      updated = { ...editTarget, actorId: editActActorId, type: editActType };
    } else {
      if (!editNoteActorId || !editNoteText.trim()) return;
      const actorIds =
        editNotePosition === "over" && editNoteActorId2
          ? [editNoteActorId, editNoteActorId2]
          : [editNoteActorId];
      updated = {
        ...editTarget,
        position: editNotePosition,
        actorIds,
        text: editNoteText.trim(),
      };
    }
    onUpdateElement(updated);
    closeEditDialog();
  };

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
    <>
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
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => openEditDialog(element)}
                  aria-label={`Edit element: ${summary}`}
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                </button>
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

    {/* Edit dialog */}
    <Dialog open={!!editTarget} onOpenChange={(open) => !open && closeEditDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editTarget?.kind === "message"
              ? "Edit Message"
              : editTarget?.kind === "activation"
                ? "Edit Activation"
                : "Edit Note"}
          </DialogTitle>
        </DialogHeader>

        {/* Message form */}
        {editTarget?.kind === "message" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-end gap-2">
              <div className="flex flex-1 flex-col gap-1">
                <label className="text-xs text-muted-foreground">From</label>
                <Select value={editMsgFrom} onValueChange={(v) => v && setEditMsgFrom(v)} items={actorItems}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select actor" />
                  </SelectTrigger>
                  <SelectContent>
                    {actors.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                disabled={!editMsgFrom || !editMsgTo}
                onClick={() => {
                  const prev = editMsgFrom;
                  setEditMsgFrom(editMsgTo);
                  setEditMsgTo(prev);
                }}
                aria-label="Swap From and To actors"
                title="Swap actors"
              >
                <ArrowLeftRightIcon className="h-4 w-4" />
              </Button>
              <div className="flex flex-1 flex-col gap-1">
                <label className="text-xs text-muted-foreground">To</label>
                <Select value={editMsgTo} onValueChange={(v) => v && setEditMsgTo(v)} items={actorItems}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select actor" />
                  </SelectTrigger>
                  <SelectContent>
                    {actors.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Label</label>
              <Input
                value={editMsgLabel}
                onChange={(e) => setEditMsgLabel(e.target.value)}
                placeholder="Message text"
                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Arrow Type</label>
              <Select
                value={editMsgArrowType}
                onValueChange={(v) => setEditMsgArrowType(v as ArrowType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ARROW_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Activation form */}
        {editTarget?.kind === "activation" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Actor</label>
              <Select value={editActActorId} onValueChange={(v) => v && setEditActActorId(v)} items={actorItems}>
                <SelectTrigger>
                  <SelectValue placeholder="Select actor" />
                </SelectTrigger>
                <SelectContent>
                  {actors.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Type</label>
              <div className="flex h-8 overflow-hidden rounded-lg border" role="group" aria-label="Activation type">
                <button
                  className={`flex-1 px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    editActType === "activate"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setEditActType("activate")}
                  aria-pressed={editActType === "activate"}
                >
                  Activate
                </button>
                <button
                  className={`flex-1 px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    editActType === "deactivate"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setEditActType("deactivate")}
                  aria-pressed={editActType === "deactivate"}
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Note form */}
        {editTarget?.kind === "note" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Position</label>
              <Select
                value={editNotePosition}
                onValueChange={(v) => setEditNotePosition(v as "left of" | "right of" | "over")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left of">Left of</SelectItem>
                  <SelectItem value="right of">Right of</SelectItem>
                  <SelectItem value="over">Over</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Actor</label>
              <Select value={editNoteActorId} onValueChange={(v) => v && setEditNoteActorId(v)} items={actorItems}>
                <SelectTrigger>
                  <SelectValue placeholder="Select actor" />
                </SelectTrigger>
                <SelectContent>
                  {actors.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editNotePosition === "over" && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Actor 2 (optional)</label>
                <Select value={editNoteActorId2} onValueChange={(v) => setEditNoteActorId2(v ?? "")} items={noteActorItems2}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {actors
                      .filter((a) => a.id !== editNoteActorId)
                      .map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Text</label>
              <Input
                value={editNoteText}
                onChange={(e) => setEditNoteText(e.target.value)}
                placeholder="Note text"
                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={closeEditDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            disabled={
              editTarget?.kind === "message"
                ? !editMsgFrom || !editMsgTo || !editMsgLabel.trim()
                : editTarget?.kind === "activation"
                  ? !editActActorId
                  : !editNoteActorId || !editNoteText.trim()
            }
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
