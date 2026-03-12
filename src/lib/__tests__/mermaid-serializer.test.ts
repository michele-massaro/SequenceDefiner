import { describe, it, expect } from "vitest";
import { serialize } from "@/lib/mermaid-serializer";
import type { DiagramState } from "@/lib/types";

describe("mermaid-serializer", () => {
  it("serializes an empty diagram", () => {
    const state: DiagramState = { actors: [], elements: [] };
    expect(serialize(state)).toBe("sequenceDiagram");
  });

  it("serializes participants without aliases", () => {
    const state: DiagramState = {
      actors: [
        { id: "a1", name: "Alice", type: "participant" },
        { id: "a2", name: "Bob", type: "participant" },
      ],
      elements: [],
    };
    const result = serialize(state);
    expect(result).toBe(
      `sequenceDiagram\n    participant Alice\n    participant Bob`
    );
  });

  it("serializes participants with aliases", () => {
    const state: DiagramState = {
      actors: [
        { id: "a1", name: "A", alias: "Alice", type: "participant" },
        { id: "a2", name: "B", alias: "Bob", type: "actor" },
      ],
      elements: [],
    };
    const result = serialize(state);
    expect(result).toBe(
      `sequenceDiagram\n    participant A as Alice\n    actor B as Bob`
    );
  });

  it("serializes messages with various arrow types", () => {
    const state: DiagramState = {
      actors: [
        { id: "a1", name: "Alice", type: "participant" },
        { id: "a2", name: "Bob", type: "participant" },
      ],
      elements: [
        {
          kind: "message",
          id: "e1",
          from: "a1",
          to: "a2",
          label: "Hello",
          arrowType: "->>",
        },
        {
          kind: "message",
          id: "e2",
          from: "a2",
          to: "a1",
          label: "Hi back",
          arrowType: "-->>",
        },
        {
          kind: "message",
          id: "e3",
          from: "a1",
          to: "a2",
          label: "Open arrow",
          arrowType: "->",
        },
        {
          kind: "message",
          id: "e4",
          from: "a1",
          to: "a2",
          label: "Cross",
          arrowType: "-x",
        },
        {
          kind: "message",
          id: "e5",
          from: "a1",
          to: "a2",
          label: "Async",
          arrowType: "-)",
        },
      ],
    };
    const result = serialize(state);
    const lines = result.split("\n");
    expect(lines[3]).toBe("    Alice->>Bob: Hello");
    expect(lines[4]).toBe("    Bob-->>Alice: Hi back");
    expect(lines[5]).toBe("    Alice->Bob: Open arrow");
    expect(lines[6]).toBe("    Alice-xBob: Cross");
    expect(lines[7]).toBe("    Alice-)Bob: Async");
  });

  it("serializes activations and deactivations", () => {
    const state: DiagramState = {
      actors: [{ id: "a1", name: "Bob", type: "participant" }],
      elements: [
        { kind: "activation", id: "e1", actorId: "a1", type: "activate" },
        { kind: "activation", id: "e2", actorId: "a1", type: "deactivate" },
      ],
    };
    const result = serialize(state);
    const lines = result.split("\n");
    expect(lines[2]).toBe("    activate Bob");
    expect(lines[3]).toBe("    deactivate Bob");
  });

  it("serializes notes", () => {
    const state: DiagramState = {
      actors: [
        { id: "a1", name: "Alice", type: "participant" },
        { id: "a2", name: "Bob", type: "participant" },
      ],
      elements: [
        {
          kind: "note",
          id: "e1",
          position: "right of",
          actorIds: ["a1"],
          text: "Thinking...",
        },
        {
          kind: "note",
          id: "e2",
          position: "over",
          actorIds: ["a1", "a2"],
          text: "Shared note",
        },
        {
          kind: "note",
          id: "e3",
          position: "left of",
          actorIds: ["a2"],
          text: "Private",
        },
      ],
    };
    const result = serialize(state);
    const lines = result.split("\n");
    expect(lines[3]).toBe("    Note right of Alice: Thinking...");
    expect(lines[4]).toBe("    Note over Alice, Bob: Shared note");
    expect(lines[5]).toBe("    Note left of Bob: Private");
  });

  it("serializes a complete diagram", () => {
    const state: DiagramState = {
      actors: [
        { id: "a1", name: "A", alias: "Alice", type: "participant" },
        { id: "a2", name: "B", alias: "Bob", type: "actor" },
      ],
      elements: [
        {
          kind: "message",
          id: "e1",
          from: "a1",
          to: "a2",
          label: "Hello Bob",
          arrowType: "->>",
        },
        { kind: "activation", id: "e2", actorId: "a2", type: "activate" },
        {
          kind: "message",
          id: "e3",
          from: "a2",
          to: "a1",
          label: "Hi Alice",
          arrowType: "-->>",
        },
        { kind: "activation", id: "e4", actorId: "a2", type: "deactivate" },
        {
          kind: "note",
          id: "e5",
          position: "over",
          actorIds: ["a1"],
          text: "Thinking...",
        },
      ],
    };
    const expected = [
      "sequenceDiagram",
      "    participant A as Alice",
      "    actor B as Bob",
      "    A->>B: Hello Bob",
      "    activate B",
      "    B-->>A: Hi Alice",
      "    deactivate B",
      "    Note over A: Thinking...",
    ].join("\n");
    expect(serialize(state)).toBe(expected);
  });
});
