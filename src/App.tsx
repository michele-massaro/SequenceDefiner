import { useCallback, useMemo, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";
import { DiagramPreview } from "@/components/DiagramPreview";
import { BottomBar } from "@/components/BottomBar";
import { ResizableDivider } from "@/components/ResizableDivider";
import { useDiagram } from "@/hooks/useDiagram";
import { useMermaid } from "@/hooks/useMermaid";
import { useTheme } from "@/components/ThemeProvider";
import { serialize } from "@/lib/mermaid-serializer";
import {
  loadDiagramFromStorage,
  clearDiagramStorage,
  useAutoSaveDiagram,
} from "@/hooks/useLocalStorage";

const restoredState = loadDiagramFromStorage();

const SIDEBAR_MIN_WIDTH = 160;
const SIDEBAR_MAX_WIDTH = 480;
const SIDEBAR_DEFAULT_WIDTH = 256;

function App() {
  const { theme } = useTheme();
  const diagram = useDiagram(restoredState ?? undefined);
  const mermaidCode = useMemo(() => serialize(diagram.state), [diagram.state]);
  const { svg, error, isRendering } = useMermaid(mermaidCode, theme);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);

  useAutoSaveDiagram(diagram.state);

  const handleNewSession = useCallback(() => {
    diagram.resetDiagram();
    clearDiagramStorage();
  }, [diagram.resetDiagram]);

  const handleSidebarResize = useCallback((delta: number) => {
    setSidebarWidth((w) =>
      Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, w + delta))
    );
  }, []);

  return (
    <div className="flex h-screen flex-col">
      <TopBar
        mermaidCode={mermaidCode}
        onNewSession={handleNewSession}
        onImport={diagram.loadState}
      />
      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar
          width={sidebarWidth}
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
        <ResizableDivider
          orientation="vertical"
          onResize={handleSidebarResize}
          className="hidden md:flex"
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DiagramPreview svg={svg} error={error} isRendering={isRendering} />
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
