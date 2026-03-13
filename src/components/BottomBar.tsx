import { useMemo, useState } from "react";
import { ArrowLeftRightIcon } from "lucide-react";
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
  { value: "->>", label: "Solid line" },
  { value: "->", label: "Solid open" },
  { value: "-->>", label: "Dotted line" },
  { value: "-->", label: "Dotted open" },
  { value: "-x", label: "Solid cross" },
  { value: "--x", label: "Dotted cross" },
  { value: "-)", label: "Solid async" },
  { value: "--)", label: "Dotted async" },
];

const ARROW_TYPE_LABEL: Record<ArrowType, string> = Object.fromEntries(
  ARROW_TYPES.map((t) => [t.value, t.label])
) as Record<ArrowType, string>;

function ArrowTypeIcon({ type }: { type: ArrowType }) {
  const dotted = type.startsWith("--");
  const lineProps = {
    x1: 2,
    y1: 8,
    x2: 50,
    y2: 8,
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    ...(dotted ? { strokeDasharray: "4 2.5" } : {}),
  };

  const arrowhead = (() => {
    if (type === "->>" || type === "-->>") {
      return <polygon points="50,4.5 62,8 50,11.5" fill="currentColor" />;
    }
    if (type === "->" || type === "-->") {
      return (
        <polyline
          points="50,4.5 62,8 50,11.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      );
    }
    if (type === "-x" || type === "--x") {
      return (
        <>
          <line x1={52} y1={4} x2={62} y2={12} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
          <line x1={52} y1={12} x2={62} y2={4} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
        </>
      );
    }
    if (type === "-)" || type === "--)") {
      return (
        <path
          d="M52,4.5 Q62,8 52,11.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        />
      );
    }
    return null;
  })();

  return (
    <svg
      width="60"
      height="16"
      viewBox="0 0 64 16"
      aria-hidden="true"
      className="shrink-0"
    >
      <line {...lineProps} />
      {arrowhead}
    </svg>
  );
}

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

  const actorLabel = (actor: Actor) => actor.name;

  const actorItems = useMemo(
    () => actors.map((a) => ({ value: a.id, label: actorLabel(a) })),
    [actors]
  );

  const noteActorItems2 = useMemo(
    () => [
      { value: "", label: "None" },
      ...actors
        .filter((a) => a.id !== noteActorId)
        .map((a) => ({ value: a.id, label: actorLabel(a) })),
    ],
    [actors, noteActorId]
  );

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
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">From</label>
            <Select value={msgFrom} onValueChange={(v) => v && setMsgFrom(v)} items={actorItems}>
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
          <div className="flex flex-col gap-1">
            <span className="h-4 shrink-0" aria-hidden="true" />
            <Button
              variant="outline"
              size="icon"
              disabled={!msgFrom || !msgTo}
              onClick={() => {
                const prevFrom = msgFrom;
                const prevTo = msgTo;
                setMsgFrom(prevTo);
                setMsgTo(prevFrom);
              }}
              aria-label="Swap From and To actors"
              title="Swap actors"
            >
              <ArrowLeftRightIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">To</label>
            <Select value={msgTo} onValueChange={(v) => v && setMsgTo(v)} items={actorItems}>
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
          <div className="min-w-0 flex-1 flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Label</label>
            <Input
              value={msgLabel}
              onChange={(e) => setMsgLabel(e.target.value)}
              placeholder="Message text"
              onKeyDown={(e) => e.key === "Enter" && handleAddMessage()}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Arrow Type</label>
            <Select
              value={msgArrowType}
              onValueChange={(v) => setMsgArrowType(v as ArrowType)}
            >
              <SelectTrigger>
                <span className="flex flex-1 items-center gap-2" data-slot="select-value">
                  <ArrowTypeIcon type={msgArrowType} />
                  <span>{ARROW_TYPE_LABEL[msgArrowType]}</span>
                </span>
              </SelectTrigger>
              <SelectContent>
                {ARROW_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <ArrowTypeIcon type={t.value} />
                    <span>{t.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="h-4 shrink-0" aria-hidden="true" />
            <Button
              onClick={handleAddMessage}
              disabled={!msgFrom || !msgTo || !msgLabel.trim()}
            >
              Add
            </Button>
          </div>
        </div>
      )}

      {activeTab === "activation" && actors.length > 0 && (
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Actor</label>
            <Select value={actActorId} onValueChange={(v) => v && setActActorId(v)} items={actorItems}>
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
          <div className="flex flex-col gap-1">
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
          <div className="flex flex-col gap-1">
            <span className="h-4 shrink-0" aria-hidden="true" />
            <Button onClick={handleAddActivation} disabled={!actActorId}>
              Add
            </Button>
          </div>
        </div>
      )}

      {activeTab === "note" && actors.length > 0 && (
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
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
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Actor</label>
            <Select value={noteActorId} onValueChange={(v) => v && setNoteActorId(v)} items={actorItems}>
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
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">
                Actor 2 (optional)
              </label>
              <Select value={noteActorId2} onValueChange={(v) => setNoteActorId2(v ?? "")} items={noteActorItems2}>
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
          <div className="min-w-0 flex-1 flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Text</label>
            <Input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Note text"
              onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="h-4 shrink-0" aria-hidden="true" />
            <Button
              onClick={handleAddNote}
              disabled={!noteActorId || !noteText.trim()}
            >
              Add
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
