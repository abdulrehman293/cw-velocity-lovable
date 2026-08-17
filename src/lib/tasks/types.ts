export const COLUMNS = ["todo", "in_progress", "done"] as const;

export type TaskStatus = (typeof COLUMNS)[number];

export const COLUMN_META: Record<TaskStatus, { title: string; accent: string }> = {
  todo: { title: "To Do", accent: "bg-chart-1" },
  in_progress: { title: "In Progress", accent: "bg-chart-2" },
  done: { title: "Done", accent: "bg-chart-3" },
};

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  /** Owner of the task — maps to auth.users.id once auth is connected. */
  user_id: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  created_at: string;
  updated_at: string;
}

export type TaskInput = Pick<Task, "title" | "description" | "status" | "priority">;
