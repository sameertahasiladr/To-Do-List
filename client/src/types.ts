export type Role = "ADMIN" | "USER";
export type Status = "INCOMPLETE" | "COMPLETE";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface Task {
  id: string;
  name: string;
  status: Status;
  priority: Priority;
  dueDate: string | null;
  userId: string;
  createdAt: string;
  user: { id: string; name: string };
}

export type TaskChanges = Partial<Pick<Task, "name" | "status" | "priority" | "dueDate">>;

export interface TaskPage {
  items: Task[];
  total: number;
  page: number;
  pages: number;
}

export interface Stats {
  total: number;
  complete: number;
  incomplete: number;
}
