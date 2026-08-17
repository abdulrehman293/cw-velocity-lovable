import type { Task, TaskInput, TaskStatus } from "./types";

/**
 * Data access contract for tasks.
 *
 * The UI only ever talks to this interface, so swapping the local
 * implementation for a backend (Lovable Cloud / Supabase) is a one-file change:
 * implement `TaskRepository` with database queries and export it as
 * `taskRepository` below.
 */
export interface TaskRepository {
  list(): Promise<Task[]>;
  create(input: TaskInput): Promise<Task>;
  update(id: string, patch: Partial<TaskInput> & { position?: number }): Promise<Task>;
  move(id: string, status: TaskStatus, position: number): Promise<Task>;
  remove(id: string): Promise<void>;
}

const STORAGE_KEY = "kanban.tasks.v1";

const now = () => new Date().toISOString();

const seed = (): Task[] => {
  const base = now();
  const rows: Array<[string, string, TaskStatus, Task["priority"]]> = [
    ["Design system audit", "Review spacing, type scale and color tokens.", "todo", "medium"],
    ["Draft Q3 roadmap", "Collect input from design and support.", "todo", "high"],
    ["Kanban drag & drop", "Wire up column reordering and status changes.", "in_progress", "high"],
    ["Onboarding emails", "Three-step welcome sequence copy.", "in_progress", "low"],
    ["Auth flow spec", "Sign-in, sign-up and session handling.", "done", "medium"],
  ];
  return rows.map(([title, description, status, priority], i) => ({
    id: `seed-${i}`,
    user_id: null,
    title,
    description,
    status,
    priority,
    position: i,
    created_at: base,
    updated_at: base,
  }));
};

function read(): Task[] {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = seed();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw) as Task[];
  } catch {
    return seed();
  }
}

function write(tasks: Task[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export const localTaskRepository: TaskRepository = {
  async list() {
    return read().sort((a, b) => a.position - b.position);
  },
  async create(input) {
    const tasks = read();
    const siblings = tasks.filter((t) => t.status === input.status);
    const task: Task = {
      id: uid(),
      user_id: null,
      ...input,
      position: siblings.length,
      created_at: now(),
      updated_at: now(),
    };
    write([...tasks, task]);
    return task;
  },
  async update(id, patch) {
    const tasks = read();
    const next = tasks.map((t) => (t.id === id ? { ...t, ...patch, updated_at: now() } : t));
    write(next);
    return next.find((t) => t.id === id)!;
  },
  async move(id, status, position) {
    const tasks = read();
    const moving = tasks.find((t) => t.id === id)!;
    const rest = tasks.filter((t) => t.id !== id);
    const column = rest.filter((t) => t.status === status).sort((a, b) => a.position - b.position);
    column.splice(Math.max(0, Math.min(position, column.length)), 0, {
      ...moving,
      status,
      updated_at: now(),
    });
    const reindexed = column.map((t, i) => ({ ...t, position: i }));
    const others = rest.filter((t) => t.status !== status);
    write([...others, ...reindexed]);
    return reindexed.find((t) => t.id === id)!;
  },
  async remove(id) {
    write(read().filter((t) => t.id !== id));
  },
};

/**
 * Swap this export for a Supabase-backed repository when the backend is enabled.
 */
export const taskRepository: TaskRepository = localTaskRepository;
