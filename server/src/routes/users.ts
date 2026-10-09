import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db";
import { authenticate, authorize, forgetUser } from "../middleware/auth";
import { createUserSchema, updateUserSchema } from "../validation";

const router = Router();
router.use(authenticate, authorize("ADMIN"));

const select = { id: true, name: true, email: true, role: true, createdAt: true } as const;

router.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({ select, orderBy: { createdAt: "asc" } });
  res.json(users);
});

router.post("/", async (req, res) => {
  const { password, ...data } = createUserSchema.parse(req.body);
  const user = await prisma.user.create({
    data: { ...data, passwordHash: await bcrypt.hash(password, 10) },
    select,
  });
  res.status(201).json(user);
});

router.patch("/:id", async (req, res) => {
  const { password, ...data } = updateUserSchema.parse(req.body);
  const isSelf = (req.params.id as string) === req.user!.id;
  if (isSelf && data.role && data.role !== "ADMIN") {
    return res.status(400).json({ message: "You cannot change your own role" });
  }
  const user = await prisma.user.update({
    where: { id: (req.params.id as string) },
    data: { ...data, ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}) },
    select,
  });
  forgetUser(user.id);
  res.json(user);
});

router.delete("/:id", async (req, res) => {
  if ((req.params.id as string) === req.user!.id) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }
  await prisma.user.delete({ where: { id: (req.params.id as string) } });
  forgetUser(req.params.id as string);
  res.status(204).end();
});

export default router;
