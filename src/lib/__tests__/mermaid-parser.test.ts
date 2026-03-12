import { describe, it, expect, beforeEach } from "vitest";
import { parse, resetParserIdCounter } from "@/lib/mermaid-parser";

beforeEach(() => {
  resetParserIdCounter();
});

describe("mermaid-parser", () => {
  it("parses an empty diagram", () => {
    const result = parse("sequenceDiagram");
    expect(result.actors).toEqual([]);
    expect(result.elements).toEqual([]);
  });

  it("parses participants without aliases", () => {
    const input = `sequenceDiagram
    participant Alice
    participant Bob`;
    const result = parse(input);
    expect(result.actors).toHaveLength(2);
    expect(result.actors[0].name).toBe("Alice");
    expect(result.actors[0].alias).toBeUndefined();
    expect(result.actors[0].type).toBe("participant");
    expect(result.actors[1].name).toBe("Bob");
    expect(result.actors[1].type).toBe("participant");
  });

  it("parses participants with aliases", () => {
    const input = `sequenceDiagram
    participant A as Alice
    actor B as Bob`;
    const result = parse(input);
    expect(result.actors).toHaveLength(2);
    expect(result.actors[0].name).toBe("A");
    expect(result.actors[0].alias).toBe("Alice");
    expect(result.actors[0].type).toBe("participant");
    expect(result.actors[1].name).toBe("B");
    expect(result.actors[1].alias).toBe("Bob");
    expect(result.actors[1].type).toBe("actor");
  });

  it("parses solid line with arrowhead message (->>)", () => {
    const input = `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello`;
    const result = parse(input);
    expect(result.elements).toHaveLength(1);
    const msg = result.elements[0];
    expect(msg.kind).toBe("message");
    if (msg.kind === "message") {
      expect(msg.arrowType).toBe("->>");
      expect(msg.label).toBe("Hello");
    }
  });

  it("parses dotted line with arrowhead message (-->>)", () => {
    const input = `sequenceDiagram
    participant Alice
    participant Bob
    Alice-->>Bob: Reply`;
    const result = parse(input);
    const msg = result.elements[0];
    if (msg.kind === "message") {
      expect(msg.arrowType).toBe("-->>");
    }
  });

  it("parses solid line without arrowhead (->)", () => {
    const input = `sequenceDiagram
    participant Alice
    participant Bob
    Alice->Bob: Open`;
    const result = parse(input);
    const msg = result.elements[0];
    if (msg.kind === "message") {
      expect(msg.arrowType).toBe("->");
    }
  });

  it("parses dotted line without arrowhead (-->)", () => {
    const input = `sequenceDiagram
    participant Alice
    participant Bob
    Alice-->Bob: Dotted open`;
    const result = parse(input);
    const msg = result.elements[0];
    if (msg.kind === "message") {
      expect(msg.arrowType).toBe("-->");
    }
  });

  it("parses solid cross (-x)", () => {
    const input = `sequenceDiagram
    participant Alice
    participant Bob
    Alice-xBob: Failed`;
    const result = parse(input);
    const msg = result.elements[0];
    if (msg.kind === "message") {
      expect(msg.arrowType).toBe("-x");
    }
  });

  it("parses dotted cross (--x)", () => {
    const input = `sequenceDiagram
    participant Alice
    participant Bob
    Alice--xBob: Failed dotted`;
    const result = parse(input);
    const msg = result.elements[0];
    if (msg.kind === "message") {
      expect(msg.arrowType).toBe("--x");
    }
  });

  it("parses solid async (-))", () => {
    const input = `sequenceDiagram
    participant Alice
    participant Bob
    Alice-)Bob: Async call`;
    const result = parse(input);
    const msg = result.elements[0];
    if (msg.kind === "message") {
      expect(msg.arrowType).toBe("-)");
    }
  });

  it("parses dotted async (--))", () => {
    const input = `sequenceDiagram
    participant Alice
    participant Bob
    Alice--)Bob: Async dotted`;
    const result = parse(input);
    const msg = result.elements[0];
    if (msg.kind === "message") {
      expect(msg.arrowType).toBe("--)");
    }
  });

  it("parses activate and deactivate", () => {
    const input = `sequenceDiagram
    participant Bob
    activate Bob
    deactivate Bob`;
    const result = parse(input);
    expect(result.elements).toHaveLength(2);
    expect(result.elements[0].kind).toBe("activation");
    if (result.elements[0].kind === "activation") {
      expect(result.elements[0].type).toBe("activate");
    }
    expect(result.elements[1].kind).toBe("activation");
    if (result.elements[1].kind === "activation") {
      expect(result.elements[1].type).toBe("deactivate");
    }
  });

  it("parses notes", () => {
    const input = `sequenceDiagram
    participant Alice
    participant Bob
    Note right of Alice: Thinking...
    Note left of Bob: Waiting
    Note over Alice, Bob: Shared`;
    const result = parse(input);
    expect(result.elements).toHaveLength(3);

    const note1 = result.elements[0];
    expect(note1.kind).toBe("note");
    if (note1.kind === "note") {
      expect(note1.position).toBe("right of");
      expect(note1.text).toBe("Thinking...");
      expect(note1.actorIds).toHaveLength(1);
    }

    const note2 = result.elements[1];
    if (note2.kind === "note") {
      expect(note2.position).toBe("left of");
      expect(note2.text).toBe("Waiting");
    }

    const note3 = result.elements[2];
    if (note3.kind === "note") {
      expect(note3.position).toBe("over");
      expect(note3.text).toBe("Shared");
      expect(note3.actorIds).toHaveLength(2);
    }
  });

  it("parses a complete diagram", () => {
    const input = `sequenceDiagram
    participant A as Alice
    actor B as Bob
    A->>B: Hello Bob
    activate B
    B-->>A: Hi Alice
    deactivate B
    Note over A: Thinking...`;
    const result = parse(input);
    expect(result.actors).toHaveLength(2);
    expect(result.elements).toHaveLength(5);
    expect(result.elements[0].kind).toBe("message");
    expect(result.elements[1].kind).toBe("activation");
    expect(result.elements[2].kind).toBe("message");
    expect(result.elements[3].kind).toBe("activation");
    expect(result.elements[4].kind).toBe("note");
  });

  it("skips empty lines", () => {
    const input = `sequenceDiagram

    participant Alice

    participant Bob

    Alice->>Bob: Hello`;
    const result = parse(input);
    expect(result.actors).toHaveLength(2);
    expect(result.elements).toHaveLength(1);
  });
});
