export function TopBar() {
  return (
    <div className="flex h-14 items-center justify-between border-b px-4">
      <h1 className="text-lg font-semibold">SequenceDefiner</h1>
      <div className="flex items-center gap-2">
        {/* Menu actions will go here: New Session, Import, Export, Theme Toggle */}
      </div>
    </div>
  );
}
