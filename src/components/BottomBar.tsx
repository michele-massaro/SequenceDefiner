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
import type { Actor, ArrowType, DiagramElement } from "@/lib/types";

type Tab = "message" | "activation" | "note";

const ARROW_TYPES: { value: ArrowType; label: string }[] = [
  { value: "->>", label: "->>  Solid line" },
  { value: "->", label: "->   Solid open" },
  { value: "-->>", label: "-->> Dotted line" },
  { value: "-->", label: "-->  Dotted open" },
  { value: "-x", label: "-x   Solid cross" },
  { value: "--x", label: "--x  Dotted cross" },
  { value: "-)", label: "-)   Solid async" },
  { value: "--)", label: "--)  Dotted async" },
];

interface BottomBarProps {
  actors: Actor[];
  onAddElement: (
    element:
      | Omit<Extract<DiagramElement, { kind: "message" }>, "id">
      | Omit<Extract<DiagramElement, { kind: "activation" }>, "id">
      | Omit<Extract<DiagramElement, { kind: "note" }>, "id">
  ) => void;
}

export function BottomBar({ actors, onAddElement }: BottomBarProps) {
  const [activeTab, setActiveTab] = useState<Tab>("message");

  // Message form state
  const [msgFrom, setMsgFrom] = useState("");
  const [msgTo, setMsgTo] = useState("");
  const [msgLabel, setMsgLabel] = useState("");
  const [msgArrowType, setMsgArrowType] = useState<ArrowType>("->>");

  // Activation form state
  const [actActorId, setActActorId] = useState("");
  const [actType, setActType] = useState<"activate" | "deactivate">("activate");

  // Note form state
  const [notePosition, setNotePosition] = useState<
    "left of" | "right of" | "over"
  >("right of");
  const [noteActorId, setNoteActorId] = useState("");
  const [noteActorId2, setNoteActorId2] = useState("");
  const [noteText, setNoteText] = useState("");

  const handleAddMessage = () => {
    if (!msgFrom || !msgTo || !msgLabel) return;
    onAddElement({
      kind: "message",
      from: msgFrom,
      to: msgTo,
      label: msgLabel,
      arrowType: msgArrowType,
    });
    setMsgLabel("");
  };

  const handleAddActivation = () => {
    if (!actActorId) return;
    onAddElement({
      kind: "activation",
      actorId: actActorId,
      type: actType,
    });
  };

  const handleAddNote = () => {
    if (!noteActorId || !noteText) return;
    const actorIds =
      notePosition === "over" && noteActorId2
        ? [noteActorId, noteActorId2]
        : [noteActorId];
    onAddElement({
      kind: "note",
      position: notePosition,
      actorIds,
      text: noteText,
    });
    setNoteText("");
  };

  const actorLabel = (actor: Actor) => actor.alias || actor.name;

  return (
    <div className="border-t p-3">
      <div className="mb-3 flex gap-1">
        {(["message", "activation", "note"] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab)}
          >
            {tab === "message"
              ? "Message"
              : tab === "activation"
                ? "Activation"
                : "Note"}
          </Button>
        ))}
      </div>

      {actors.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Add actors in the sidebar to start building your diagram.
        </p>
      )}

      {activeTab === "message" && actors.length > 0 && (
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">From</label>
            <Select value={msgFrom} onValueChange={(v) => v && setMsgFrom(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select actor" />
              </SelectTrigger>
              <SelectContent>
                {actors.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {actorLabel(a)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">To</label>
            <Select value={msgTo} onValueChange={(v) => v && setMsgTo(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select actor" />
              </SelectTrigger>
              <SelectContent>
                {actors.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {actorLabel(a)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">Label</label>
            <Input
              value={msgLabel}
              onChange={(e) => setMsgLabel(e.target.value)}
              placeholder="Message text"
              onKeyDown={(e) => e.key === "Enter" && handleAddMessage()}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Arrow Type</label>
            <Select
              value={msgArrowType}
              onValueChange={(v) => setMsgArrowType(v as ArrowType)}
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
          <Button
            onClick={handleAddMessage}
            disabled={!msgFrom || !msgTo || !msgLabel.trim()}
          >
            Add
          </Button>
        </div>
      )}

      {activeTab === "activation" && actors.length > 0 && (
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Actor</label>
            <Select value={actActorId} onValueChange={(v) => v && setActActorId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select actor" />
              </SelectTrigger>
              <SelectContent>
                {actors.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {actorLabel(a)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Type</label>
            <div className="flex h-8 overflow-hidden rounded-lg border" role="group" aria-label="Activation type">
              <button
                className={`px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  actType === "activate"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
                onClick={() => setActType("activate")}
                aria-pressed={actType === "activate"}
              >
                Activate
              </button>
              <button
                className={`px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  actType === "deactivate"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
                onClick={() => setActType("deactivate")}
                aria-pressed={actType === "deactivate"}
              >
                Deactivate
              </button>
            </div>
          </div>
          <Button onClick={handleAddActivation} disabled={!actActorId}>
            Add
          </Button>
        </div>
      )}

      {activeTab === "note" && actors.length > 0 && (
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Position</label>
            <Select
              value={notePosition}
              onValueChange={(v) =>
                setNotePosition(v as "left of" | "right of" | "over")
              }
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
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Actor</label>
            <Select value={noteActorId} onValueChange={(v) => v && setNoteActorId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select actor" />
              </SelectTrigger>
              <SelectContent>
                {actors.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {actorLabel(a)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {notePosition === "over" && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Actor 2 (optional)
              </label>
              <Select value={noteActorId2} onValueChange={(v) => setNoteActorId2(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {actors
                    .filter((a) => a.id !== noteActorId)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {actorLabel(a)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">Text</label>
            <Input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Note text"
              onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
            />
          </div>
          <Button
            onClick={handleAddNote}
            disabled={!noteActorId || !noteText.trim()}
          >
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
