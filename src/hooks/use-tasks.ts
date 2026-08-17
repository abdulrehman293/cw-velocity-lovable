import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskRepository } from "@/lib/tasks/repository";
import type { TaskInput, TaskStatus } from "@/lib/tasks/types";

export const tasksQueryOptions = {
  queryKey: ["tasks"] as const,
  queryFn: () => taskRepository.list(),
};

export function useTasks() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["tasks"] });

  const query = useQuery(tasksQueryOptions);

  const create = useMutation({
    mutationFn: (input: TaskInput) => taskRepository.create(input),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<TaskInput> }) =>
      taskRepository.update(id, patch),
    onSuccess: invalidate,
  });

  const move = useMutation({
    mutationFn: ({ id, status, position }: { id: string; status: TaskStatus; position: number }) =>
      taskRepository.move(id, status, position),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => taskRepository.remove(id),
    onSuccess: invalidate,
  });

  return { tasks: query.data ?? [], isLoading: query.isLoading, create, update, move, remove };
}
