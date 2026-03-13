import type { Actor, DiagramElement, DiagramState } from "@/lib/types";

function serializeActor(actor: Actor): string {
  const keyword = actor.type === "actor" ? "actor" : "participant";
  return `    ${keyword} ${actor.id} as ${actor.name}`;
}

function resolveActorName(actorId: string, actors: Actor[]): string {
  const actor = actors.find((a) => a.id === actorId);
  return actor ? actor.id : actorId;
}

function serializeElement(element: DiagramElement, actors: Actor[]): string {
  switch (element.kind) {
    case "message": {
      const from = resolveActorName(element.from, actors);
      const to = resolveActorName(element.to, actors);
      return `    ${from}${element.arrowType}${to}: ${element.label}`;
    }
    case "activation": {
      const actorName = resolveActorName(element.actorId, actors);
      return `    ${element.type} ${actorName}`;
    }
    case "note": {
      const actorRefs = element.actorIds
        .map((id) => resolveActorName(id, actors))
        .join(", ");
      return `    Note ${element.position} ${actorRefs}: ${element.text}`;
    }
  }
}

export function serialize(state: DiagramState): string {
  const lines: string[] = ["sequenceDiagram"];

  for (const actor of state.actors) {
    lines.push(serializeActor(actor));
  }

  for (const element of state.elements) {
    lines.push(serializeElement(element, state.actors));
  }

  return lines.join("\n");
}
