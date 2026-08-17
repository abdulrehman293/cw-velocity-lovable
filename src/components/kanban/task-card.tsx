import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/tasks/types";

const priorityStyles: Record<Task["priority"], string> = {
  low: "border-chart-1/40 text-chart-1",
  medium: "border-chart-2/40 text-chart-2",
  high: "border-chart-4/40 text-chart-4",
};

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  dragging: boolean;
}

export function TaskCard({ task, onEdit, onDelete, onDragStart, onDragEnd, dragging }: Props) {
  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", task.id);
        onDragStart(task);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group cursor-grab rounded-xl border border-border/70 bg-card p-3 transition-all active:cursor-grabbing",
        "hover:border-primary/50 hover:shadow-[var(--glow-primary)]",
        dragging && "opacity-40",
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm leading-snug font-medium text-card-foreground">{task.title}</h3>
          {task.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
          ) : null}
          <div className="mt-3 flex items-center justify-between">
            <Badge variant="outline" className={cn("capitalize", priorityStyles[task.priority])}>
              {task.priority}
            </Badge>
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                aria-label={`Edit ${task.title}`}
                onClick={() => onEdit(task)}
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-7 text-destructive hover:text-destructive"
                aria-label={`Delete ${task.title}`}
                onClick={() => onDelete(task)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
