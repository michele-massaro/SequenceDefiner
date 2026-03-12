import { useMemo } from "react";
import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";
import { DiagramPreview } from "@/components/DiagramPreview";
import { BottomBar } from "@/components/BottomBar";
import { useDiagram } from "@/hooks/useDiagram";
import { useMermaid } from "@/hooks/useMermaid";
import { serialize } from "@/lib/mermaid-serializer";

function App() {
  const diagram = useDiagram();
  const mermaidCode = useMemo(() => serialize(diagram.state), [diagram.state]);
  const { svg, error } = useMermaid(mermaidCode);

  return (
    <div className="flex h-screen flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DiagramPreview svg={svg} error={error} />
          <BottomBar
            actors={diagram.state.actors}
            onAddElement={diagram.addElement}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
