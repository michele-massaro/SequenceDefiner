import { describe, it, expect } from "vitest";
import { serialize } from "@/lib/mermaid-serializer";
import type { DiagramState } from "@/lib/types";

describe("mermaid-serializer", () => {
  it("serializes an empty diagram", () => {
    const state: DiagramState = { actors: [], elements: [] };
    expect(serialize(state)).toBe("sequenceDiagram");
  });

  it("serializes title as front matter when provided", () => {
    const state: DiagramState = { title: "My Diagram", actors: [], elements: [] };
    expect(serialize(state)).toBe("---\ntitle: My Diagram\n---\nsequenceDiagram");
  });

  it("serializes participants using id as mermaid name and name as alias", () => {
    const state: DiagramState = {
      actors: [
        { id: "a1", name: "Alice", type: "participant" },
        { id: "a2", name: "Bob", type: "participant" },
      ],
      elements: [],
    };
    const result = serialize(state);
    expect(result).toBe(
      `sequenceDiagram\n    participant a1 as Alice\n    participant a2 as Bob`
    );
  });

  it("serializes participants with spaces in name", () => {
    const state: DiagramState = {
      actors: [
        { id: "a1", name: "Actor One", type: "participant" },
        { id: "a2", name: "Actor Two", type: "actor" },
      ],
      elements: [],
    };
    const result = serialize(state);
    expect(result).toBe(
      `sequenceDiagram\n    participant a1 as Actor One\n    actor a2 as Actor Two`
    );
  });

  it("serializes messages using actor ids as references", () => {
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
    expect(lines[3]).toBe("    a1->>a2: Hello");
    expect(lines[4]).toBe("    a2-->>a1: Hi back");
    expect(lines[5]).toBe("    a1->a2: Open arrow");
    expect(lines[6]).toBe("    a1-xa2: Cross");
    expect(lines[7]).toBe("    a1-)a2: Async");
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
    expect(lines[2]).toBe("    activate a1");
    expect(lines[3]).toBe("    deactivate a1");
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
    expect(lines[3]).toBe("    Note right of a1: Thinking...");
    expect(lines[4]).toBe("    Note over a1, a2: Shared note");
    expect(lines[5]).toBe("    Note left of a2: Private");
  });

  it("serializes a complete diagram", () => {
    const state: DiagramState = {
      actors: [
        { id: "a1", name: "Alice", type: "participant" },
        { id: "a2", name: "Bob", type: "actor" },
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
      "    participant a1 as Alice",
      "    actor a2 as Bob",
      "    a1->>a2: Hello Bob",
      "    activate a2",
      "    a2-->>a1: Hi Alice",
      "    deactivate a2",
      "    Note over a1: Thinking...",
    ].join("\n");
    expect(serialize(state)).toBe(expected);
  });
});
