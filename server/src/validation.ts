import { z } from "zod";

const status = z.enum(["INCOMPLETE", "COMPLETE"]);
const priority = z.enum(["LOW", "MEDIUM", "HIGH"]);
const role = z.enum(["ADMIN", "USER"]);

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD");


const dueDate = z
  .string()
  .nullable()
  .optional()
  .transform((v, ctx) => {
    if (v === undefined) return undefined;
    if (v === null || v === "") return null;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid due date" });
      return z.NEVER;
    }
    return d;
  });

const taskName = z.string().trim().min(1, "Task name is required").max(200);

export const createTaskSchema = z.object({
  name: taskName,
  status: status.default("INCOMPLETE"),
  priority: priority.default("MEDIUM"),
  dueDate,
});

export const updateTaskSchema = z.object({
  name: taskName.optional(),
  status: status.optional(),
  priority: priority.optional(),
  dueDate,
});

export const listTasksSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(8),
  status: status.optional(),
  priority: priority.optional(),
  search: z.string().trim().optional(),
  sort: z.enum(["createdAt", "name", "status", "priority", "dueDate"]).default("createdAt"),
  due: z.enum(["overdue", "today", "week"]).optional(),
  today: dateString.optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const statsSchema = z.object({ today: dateString.optional() });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "Password is required"),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  role: role.default("USER"),
});
export const updateUserSchema = z.object({
  name: createUserSchema.shape.name.optional(),
  email: createUserSchema.shape.email.optional(),
  password: createUserSchema.shape.password.optional(),
  role: role.optional(),
});
