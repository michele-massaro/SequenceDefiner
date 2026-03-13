import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Actor, ActorType } from "@/lib/types";
import {
  PlusIcon,
  Trash2Icon,
  PencilIcon,
  GripVerticalIcon,
  UserIcon,
  BoxIcon,
} from "lucide-react";

interface ActorListProps {
  actors: Actor[];
  onAddActor: (name: string, type: ActorType) => void;
  onRemoveActor: (actorId: string) => void;
  onRenameActor: (actorId: string, name: string) => void;
  onReorderActor: (actorId: string, newIndex: number) => void;
  onUpdateActorType: (actorId: string, type: ActorType) => void;
}

export function ActorList({
  actors,
  onAddActor,
  onRemoveActor,
  onRenameActor,
  onReorderActor,
  onUpdateActorType,
}: ActorListProps) {
  // Drag-and-drop state
  const [draggedActorId, setDraggedActorId] = useState<string | null>(null);
  const [dragOverActorId, setDragOverActorId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, actorId: string) => {
    setDraggedActorId(actorId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, actorId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (actorId !== draggedActorId) {
      setDragOverActorId(actorId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const related = e.relatedTarget as Node | null;
    if (!related || !e.currentTarget.contains(related)) {
      setDragOverActorId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetActorId: string) => {
    e.preventDefault();
    if (draggedActorId && draggedActorId !== targetActorId) {
      const newIndex = actors.findIndex((a) => a.id === targetActorId);
      onReorderActor(draggedActorId, newIndex);
    }
    setDraggedActorId(null);
    setDragOverActorId(null);
  };

  const handleDragEnd = () => {
    setDraggedActorId(null);
    setDragOverActorId(null);
  };

  // Add actor form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<ActorType>("participant");

  // Remove confirmation dialog
  const [removeTarget, setRemoveTarget] = useState<Actor | null>(null);

  // Edit dialog
  const [editTarget, setEditTarget] = useState<Actor | null>(null);
  const [editName, setEditName] = useState("");

  const isDuplicateName = (name: string, excludeId?: string): boolean => {
    if (!name.trim()) return false;
    const lower = name.trim().toLowerCase();
    return actors.some(
      (a) =>
        a.id !== excludeId &&
        a.name.toLowerCase() === lower
    );
  };

  const newNameDuplicate = isDuplicateName(newName);
  const editNameDuplicate = editTarget
    ? isDuplicateName(editName, editTarget.id)
    : false;

  const handleAdd = () => {
    const name = newName.trim();
    if (!name || newNameDuplicate) return;
    onAddActor(name, newType);
    setNewName("");
    setNewType("participant");
    setShowAddForm(false);
  };

  const handleConfirmRemove = () => {
    if (removeTarget) {
      onRemoveActor(removeTarget.id);
      setRemoveTarget(null);
    }
  };

  const openEditDialog = (actor: Actor) => {
    setEditTarget(actor);
    setEditName(actor.name);
  };

  const handleSaveEdit = () => {
    if (editTarget && editName.trim() && !editNameDuplicate) {
      onRenameActor(editTarget.id, editName.trim());
      setEditTarget(null);
    }
  };

  return (
    <div className="p-3 pt-0">
      {actors.length === 0 && !showAddForm && (
        <p className="text-sm text-muted-foreground">No actors defined yet.</p>
      )}

      {/* Actor list */}
      <div className="space-y-1">
        {actors.map((actor, index) => (
          <div
            key={actor.id}
            draggable
            onDragStart={(e) => handleDragStart(e, actor.id)}
            onDragOver={(e) => handleDragOver(e, actor.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, actor.id)}
            onDragEnd={handleDragEnd}
            className={`group flex items-center gap-1.5 rounded-md px-2 py-1 transition-opacity ${
              draggedActorId === actor.id
                ? "opacity-40"
                : dragOverActorId === actor.id
                  ? "bg-accent"
                  : "hover:bg-muted"
            }`}
          >
            {/* Drag handle */}
            <GripVerticalIcon
              className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/40 hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
              role="button"
              tabIndex={0}
              aria-label={`Reorder ${actor.name}. Use arrow keys to move.`}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (index > 0) onReorderActor(actor.id, index - 1);
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (index < actors.length - 1) onReorderActor(actor.id, index + 1);
                }
              }}
            />

            {/* Type icon */}
            <TooltipProvider delay={300}>
              <Tooltip>
                <TooltipTrigger
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    onUpdateActorType(
                      actor.id,
                      actor.type === "participant" ? "actor" : "participant"
                    )
                  }
                >
                  {actor.type === "actor" ? (
                    <UserIcon className="h-3.5 w-3.5" />
                  ) : (
                    <BoxIcon className="h-3.5 w-3.5" />
                  )}
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>
                    {actor.type === "participant" ? "Participant" : "Actor"} —
                    click to toggle
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Name */}
            <div className="min-w-0 flex-1 truncate text-sm">
              <span>{actor.name}</span>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <button
                className="rounded p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => openEditDialog(actor)}
                aria-label={`Edit ${actor.name}`}
              >
                <PencilIcon className="h-3.5 w-3.5" />
              </button>
              <button
                className="rounded p-0.5 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setRemoveTarget(actor)}
                aria-label={`Remove ${actor.name}`}
              >
                <Trash2Icon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add actor form */}
      {showAddForm ? (
        <div className="mt-2 space-y-2 rounded-md border p-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          {newNameDuplicate && (
            <p className="text-xs text-destructive">Name already in use.</p>
          )}
          <Select
            value={newType}
            onValueChange={(v) => setNewType(v as ActorType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="participant">Participant</SelectItem>
              <SelectItem value="actor">Actor</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button size="sm" onClick={handleAdd} disabled={!newName.trim() || newNameDuplicate}>
              Add
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setNewName("");
                setNewType("participant");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={() => setShowAddForm(true)}
        >
          <PlusIcon className="mr-1 h-3.5 w-3.5" />
          Add Actor
        </Button>
      )}

      {/* Remove confirmation dialog */}
      <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Actor</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <strong>{removeTarget?.name}</strong>? All messages, activations,
              and notes referencing this actor will also be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmRemove}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Actor</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
              />
              {editNameDuplicate && (
                <p className="text-xs text-destructive">Name already in use.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editName.trim() || editNameDuplicate}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
