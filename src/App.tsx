import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";
import { DiagramPreview } from "@/components/DiagramPreview";
import { BottomBar } from "@/components/BottomBar";

function App() {
  return (
    <div className="flex h-screen flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DiagramPreview />
          <BottomBar />
        </div>
      </div>
    </div>
  );
}

export default App;
