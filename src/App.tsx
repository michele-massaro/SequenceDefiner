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
      <TopBar
        mermaidCode={mermaidCode}
        onNewSession={diagram.resetDiagram}
        onImport={diagram.loadState}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
            actors={diagram.state.actors}
            elements={diagram.state.elements}
            onAddActor={diagram.addActor}
            onRemoveActor={diagram.removeActor}
            onRenameActor={diagram.renameActor}
            onReorderActor={diagram.reorderActor}
            onUpdateActorType={diagram.updateActorType}
            onRemoveElement={diagram.removeElement}
            onReorderElement={diagram.reorderElement}
          />
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
