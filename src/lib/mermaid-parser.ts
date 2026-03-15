import type {
  Actor,
  ActorType,
  ArrowType,
  DiagramElement,
  DiagramState,
} from "@/lib/types";

let parserId = 1;
function generateParserId(): string {
  return `parsed-${parserId++}-${Date.now()}`;
}

export function resetParserIdCounter(): void {
  parserId = 1;
}

const ARROW_TYPES: ArrowType[] = [
  "->>",
  "-->>",
  "-->",
  "->",
  "--x",
  "-x",
  "--)",
  "-)",
];

// Sort by length descending so longer arrows match first (e.g. -->> before -->)
const SORTED_ARROWS = [...ARROW_TYPES].sort((a, b) => b.length - a.length);

function parseActorLine(
  line: string
): { name: string; alias?: string; type: ActorType } | null {
  const match = line.match(
    /^\s*(participant|actor)\s+(.+?)(?:\s+as\s+(.+))?\s*$/
  );
  if (!match) return null;
  const type: ActorType = match[1] as ActorType;
  const name = match[2].trim();
  const alias = match[3]?.trim();
  return { name, alias, type };
}

function parseMessageLine(
  line: string,
  actorsByName: Map<string, Actor>
): DiagramElement | null {
  for (const arrow of SORTED_ARROWS) {
    const escapedArrow = arrow.replace(/[-)>]/g, (c) => `\\${c}`);
    const regex = new RegExp(
      `^\\s*(.+?)\\s*${escapedArrow}\\s*(.+?)\\s*:\\s*(.+)\\s*$`
    );
    const match = line.match(regex);
    if (match) {
      const fromName = match[1].trim();
      const toName = match[2].trim();
      const label = match[3].trim();
      const fromActor = actorsByName.get(fromName);
      const toActor = actorsByName.get(toName);
      if (!fromActor || !toActor) return null;
      return {
        kind: "message",
        id: generateParserId(),
        from: fromActor.id,
        to: toActor.id,
        label,
        arrowType: arrow,
      };
    }
  }
  return null;
}

function parseActivationLine(
  line: string,
  actorsByName: Map<string, Actor>
): DiagramElement | null {
  const match = line.match(/^\s*(activate|deactivate)\s+(.+?)\s*$/);
  if (!match) return null;
  const type = match[1] as "activate" | "deactivate";
  const actorName = match[2].trim();
  const actor = actorsByName.get(actorName);
  if (!actor) return null;
  return {
    kind: "activation",
    id: generateParserId(),
    actorId: actor.id,
    type,
  };
}

function parseNoteLine(
  line: string,
  actorsByName: Map<string, Actor>
): DiagramElement | null {
  const match = line.match(
    /^\s*Note\s+(left of|right of|over)\s+(.+?)\s*:\s*(.+)\s*$/i
  );
  if (!match) return null;
  const position = match[1].toLowerCase() as "left of" | "right of" | "over";
  const actorNamesStr = match[2].trim();
  const text = match[3].trim();

  const actorNames = actorNamesStr.split(",").map((n) => n.trim());
  const actorIds: string[] = [];
  for (const name of actorNames) {
    const actor = actorsByName.get(name);
    if (!actor) return null;
    actorIds.push(actor.id);
  }

  return {
    kind: "note",
    id: generateParserId(),
    position,
    actorIds,
    text,
  };
}

export function parse(input: string): DiagramState {
  resetParserIdCounter();

  const lines = input.split("\n");
  const actors: Actor[] = [];
  const elements: DiagramElement[] = [];
  const actorsByName = new Map<string, Actor>();
  let title: string | undefined;

  // Parse optional YAML front matter block (---\ntitle: ...\n---)
  let lineStart = 0;
  if (lines[0]?.trim() === "---") {
    const closingIndex = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
    if (closingIndex !== -1) {
      for (let i = 1; i < closingIndex; i++) {
        const match = lines[i].match(/^\s*title\s*:\s*(.+)$/);
        if (match) {
          title = match[1].trim();
        }
      }
      lineStart = closingIndex + 1;
    }
  }

  for (let i = lineStart; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines and the sequenceDiagram header
    if (!trimmed || trimmed === "sequenceDiagram") continue;

    // Try parsing as actor declaration
    const actorResult = parseActorLine(trimmed);
    if (actorResult) {
      const actor: Actor = {
        id: generateParserId(),
        name: actorResult.alias ?? actorResult.name,
        type: actorResult.type,
      };
      actors.push(actor);
      actorsByName.set(actorResult.name, actor);
      continue;
    }

    // Try parsing as activation/deactivation
    const activationResult = parseActivationLine(trimmed, actorsByName);
    if (activationResult) {
      elements.push(activationResult);
      continue;
    }

    // Try parsing as note
    const noteResult = parseNoteLine(trimmed, actorsByName);
    if (noteResult) {
      elements.push(noteResult);
      continue;
    }

    // Try parsing as message
    const messageResult = parseMessageLine(trimmed, actorsByName);
    if (messageResult) {
      elements.push(messageResult);
      continue;
    }
  }

  return { title: title ?? "Title", actors, elements };
}
