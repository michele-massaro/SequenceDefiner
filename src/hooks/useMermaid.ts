import { useCallback, useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  securityLevel: "loose",
  theme: "default",
});

let renderCounter = 0;

export function useMermaid(code: string) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const currentRender = useRef(0);

  const render = useCallback(async (source: string) => {
    const renderId = ++renderCounter;
    currentRender.current = renderId;

    if (!source.trim()) {
      setSvg("");
      setError(null);
      return;
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
    render(code);
  }, [code, render]);

  return { svg, error };
}
