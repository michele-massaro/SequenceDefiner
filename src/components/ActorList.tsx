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
  ChevronUpIcon,
  ChevronDownIcon,
  UserIcon,
  BoxIcon,
} from "lucide-react";

interface ActorListProps {
  actors: Actor[];
  onAddActor: (name: string, type: ActorType, alias?: string) => void;
  onRemoveActor: (actorId: string) => void;
  onRenameActor: (actorId: string, name: string, alias?: string) => void;
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
  // Add actor form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAlias, setNewAlias] = useState("");
  const [newType, setNewType] = useState<ActorType>("participant");

  // Remove confirmation dialog
  const [removeTarget, setRemoveTarget] = useState<Actor | null>(null);

  // Edit dialog
  const [editTarget, setEditTarget] = useState<Actor | null>(null);
  const [editName, setEditName] = useState("");
  const [editAlias, setEditAlias] = useState("");

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    const alias = newAlias.trim() || undefined;
    onAddActor(name, newType, alias);
    setNewName("");
    setNewAlias("");
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
    setEditAlias(actor.alias || "");
  };

  const handleSaveEdit = () => {
    if (editTarget && editName.trim()) {
      const alias = editAlias.trim() || undefined;
      onRenameActor(editTarget.id, editName.trim(), alias);
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
            className="group flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-muted"
          >
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

            {/* Name and alias */}
            <div className="min-w-0 flex-1 truncate text-sm">
              <span>{actor.name}</span>
              {actor.alias && (
                <span className="ml-1 text-muted-foreground">
                  ({actor.alias})
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                onClick={() => onReorderActor(actor.id, index - 1)}
                disabled={index === 0}
              >
                <ChevronUpIcon className="h-3.5 w-3.5" />
              </button>
              <button
                className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                onClick={() => onReorderActor(actor.id, index + 1)}
                disabled={index === actors.length - 1}
              >
                <ChevronDownIcon className="h-3.5 w-3.5" />
              </button>
              <button
                className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                onClick={() => openEditDialog(actor)}
              >
                <PencilIcon className="h-3.5 w-3.5" />
              </button>
              <button
                className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                onClick={() => setRemoveTarget(actor)}
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
          <Input
            value={newAlias}
            onChange={(e) => setNewAlias(e.target.value)}
            placeholder="Alias (optional)"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
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
            <Button size="sm" onClick={handleAdd} disabled={!newName.trim()}>
              Add
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setNewName("");
                setNewAlias("");
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
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Alias (optional)
              </label>
              <Input
                value={editAlias}
                onChange={(e) => setEditAlias(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
