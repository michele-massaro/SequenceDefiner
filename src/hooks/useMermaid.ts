import { useCallback, useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

let renderCounter = 0;
let currentMermaidTheme: "default" | "dark" | null = null;

export function useMermaid(code: string, theme: "light" | "dark" = "light") {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const currentRender = useRef(0);

  const mermaidTheme = theme === "dark" ? ("dark" as const) : ("default" as const);

  const render = useCallback(async (source: string, mTheme: "default" | "dark") => {
    const renderId = ++renderCounter;
    currentRender.current = renderId;

    if (!source.trim()) {
      setSvg("");
      setError(null);
      return;
    }

    if (currentMermaidTheme !== mTheme) {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        theme: mTheme,
      });
      currentMermaidTheme = mTheme;
    }

    try {
      const { svg: rendered } = await mermaid.render(
        `mermaid-diagram-${renderId}`,
        source
      );
      // Only update if this is still the latest render request
      if (currentRender.current === renderId) {
        setSvg(rendered);
        setError(null);
      }
    } catch (err) {
      if (currentRender.current === renderId) {
        setSvg("");
        setError(err instanceof Error ? err.message : String(err));
      }
    }
  }, []);

  useEffect(() => {
    render(code, mermaidTheme);
  }, [code, mermaidTheme, render]);

  return { svg, error };
}
