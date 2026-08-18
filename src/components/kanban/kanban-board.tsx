import { supabase } from "@/supabase";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/use-tasks";
import { COLUMNS, COLUMN_META, type Task, type TaskInput, type TaskStatus } from "@/lib/tasks/types";
import { cn } from "@/lib/utils";
import { TaskCard } from "./task-card";
import { TaskDialog } from "./task-dialog";

export function KanbanBoard() {
  const { tasks, isLoading, create, update, move, remove } = useTasks();
  const [dragging, setDragging] = useState<Task | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");

  const grouped = useMemo(() => {
    const map = Object.fromEntries(COLUMNS.map((c) => [c, [] as Task[]])) as Record<
      TaskStatus,
      Task[]
    >;
    for (const t of tasks) map[t.status]?.push(t);
    for (const c of COLUMNS) map[c].sort((a, b) => a.position - b.position);
    return map;
  }, [tasks]);

  const openNew = (status: TaskStatus) => {
    setEditing(null);
    setDefaultStatus(status);
    setDialogOpen(true);
  };

  const handleSubmit = (input: TaskInput) => {
    if (editing) {
      update.mutate({ id: editing.id, patch: input });
      toast.success("Task updated");
    } else {
      create.mutate(input);
      toast.success("Task created");
    }
  };

  const handleDrop = (status: TaskStatus) => {
    setOverColumn(null);
    if (!dragging) return;
    const position = grouped[status].filter((t) => t.id !== dragging.id).length;
    if (dragging.status !== status) {
      move.mutate({ id: dragging.id, status, position });
      toast.success(`Moved to ${COLUMN_META[status].title}`);
    }
    setDragging(null);
  };

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {tasks.length} task{tasks.length === 1 ? "" : "s"} on the board
        </p>
        <Button onClick={() => openNew("todo")}>
          <Plus className="size-4" /> New task
        </Button>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">

        {COLUMNS.map((status) => {
          const meta = COLUMN_META[status];
          const items = grouped[status];
          return (
            <section
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                setOverColumn(status);
              }}
              onDragLeave={() => setOverColumn((c) => (c === status ? null : c))}
              onDrop={() => handleDrop(status)}
              className={cn(
                "panel flex min-h-[24rem] flex-col rounded-2xl border border-border/60 p-4 transition-colors",
                overColumn === status && "border-primary/60 bg-accent/20",
              )}
            >
              <header className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2.5 rounded-full", meta.accent)} />
                  <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                    {meta.title}
                  </h2>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7"
                  aria-label={`Add task to ${meta.title}`}
                  onClick={() => openNew(status)}
                >
                  <Plus className="size-4" />
                </Button>
              </header>

              <div className="flex flex-1 flex-col gap-3">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : items.length === 0 ? (
                  <button
                    onClick={() => openNew(status)}
                    className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/70 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                  >
                    Drop a task here
                  </button>
                ) : (
                  items.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      dragging={dragging?.id === task.id}
                      onDragStart={setDragging}
                      onDragEnd={() => setDragging(null)}
                      onEdit={(t) => {
                        setEditing(t);
                        setDialogOpen(true);
                      }}
                      onDelete={(t) => {
                        remove.mutate(t.id);
                        toast.success("Task deleted");
                      }}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editing}
        defaultStatus={defaultStatus}
        onSubmit={handleSubmit}
      />
    </>
  );
}
