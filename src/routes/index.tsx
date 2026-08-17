import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid } from "lucide-react";
import { KanbanBoard } from "@/components/kanban/kanban-board";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flowdeck — Kanban Task Dashboard" },
      {
        name: "description",
        content:
          "A fast, dark-mode Kanban dashboard to add, edit, drag and delete tasks across To Do, In Progress and Done.",
      },
      { property: "og:title", content: "Flowdeck — Kanban Task Dashboard" },
      {
        property: "og:description",
        content: "Plan and track work across To Do, In Progress and Done in a clean dark board.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="glow-ring flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <LayoutGrid className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Flowdeck</h1>
            <p className="text-sm text-muted-foreground">
              Your team's work, organised across three columns.
            </p>
          </div>
        </div>
      </header>

      <KanbanBoard />
    </main>
  );
}
