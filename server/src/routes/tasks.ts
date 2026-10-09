import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { authenticate, authorize } from "../middleware/auth";
import { createTaskSchema, listTasksSchema, updateTaskSchema } from "../validation";

const router = Router();
router.use(authenticate);

const include = { user: { select: { id: true, name: true } } };

const dayStart = (s?: string) => new Date(`${s ?? new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);

const scopeFor = (req: { user?: { id: string; role: string } }): Prisma.TaskWhereInput =>
  req.user!.role === "ADMIN" ? {} : { userId: req.user!.id };


router.get("/stats", async (req, res) => {
  const groups = await prisma.task.groupBy({ by: ["status"], where: scopeFor(req), _count: { _all: true } });
  const complete = groups.find((g: { status: string; _count: { _all: number } }) => g.status === "COMPLETE")?._count._all ?? 0;
  const incomplete = groups.find((g: { status: string; _count: { _all: number } }) => g.status === "INCOMPLETE")?._count._all ?? 0;
  res.json({ total: complete + incomplete, complete, incomplete });
});

router.get("/", async (req, res) => {
  const q = listTasksSchema.parse(req.query);

  const where: Prisma.TaskWhereInput = scopeFor(req);
  if (q.status) where.status = q.status;
  if (q.priority) where.priority = q.priority;
  if (q.search) where.name = { contains: q.search, mode: "insensitive" };

  if (q.due) {
    const today = dayStart(q.today);
    if (q.due === "overdue") {
      where.dueDate = { lt: today };
      where.AND = [{ status: "INCOMPLETE" }]; // completed tasks are never "overdue"
    } else if (q.due === "today") {
      where.dueDate = { gte: today, lt: addDays(today, 1) };
    } else {
      where.dueDate = { gte: today, lt: addDays(today, 7) };
    }
  }

  const orderBy = (
    q.sort === "dueDate" ? { dueDate: { sort: q.order, nulls: "last" } } : { [q.sort]: q.order }
  ) as Prisma.TaskOrderByWithRelationInput;

  const [total, items] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({ where, include, orderBy, skip: (q.page - 1) * q.limit, take: q.limit }),
  ]);
  res.json({ items, total, page: q.page, pages: Math.max(1, Math.ceil(total / q.limit)) });
});

router.post("/", authorize("USER"), async (req, res) => {
  const data = createTaskSchema.parse(req.body);
  const task = await prisma.task.create({ data: { ...data, userId: req.user!.id }, include });
  res.status(201).json(task);
});

router.patch("/:id", authorize("USER"), async (req, res) => {
  const data = updateTaskSchema.parse(req.body);
  const { count } = await prisma.task.updateMany({ where: { id: req.params.id as string, userId: req.user!.id }, data });
  if (count === 0) return res.status(404).json({ message: "Task not found" });
  res.json({ ok: true });
});

router.delete("/:id", authorize("USER"), async (req, res) => {
  const { count } = await prisma.task.deleteMany({ where: { id: req.params.id as string, userId: req.user!.id } });
  if (count === 0) return res.status(404).json({ message: "Task not found" });
  res.status(204).end();
});

export default router;
