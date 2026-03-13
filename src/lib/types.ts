export type ActorType = "participant" | "actor";

export interface Actor {
  id: string;
  name: string;
  type: ActorType;
}

export type ArrowType = "->>" | "->" | "-->>" | "-->" | "-x" | "--x" | "-)" | "--)";

export interface Message {
  kind: "message";
  id: string;
  from: string;
  to: string;
  label: string;
  arrowType: ArrowType;
}

export interface Activation {
  kind: "activation";
  id: string;
  actorId: string;
  type: "activate" | "deactivate";
}

export interface Note {
  kind: "note";
  id: string;
  position: "left of" | "right of" | "over";
  actorIds: string[];
  text: string;
}

export type DiagramElement = Message | Activation | Note;

export interface DiagramState {
  actors: Actor[];
  elements: DiagramElement[];
}
