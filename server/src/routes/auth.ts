import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { prisma } from "../db";
import { authenticate } from "../middleware/auth";
import { loginSchema } from "../validation";

const router = Router();
const publicFields = { id: true, name: true, email: true, role: true } as const;

router.post("/login", async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user && (await bcrypt.compare(password, user.passwordHash));
  if (!user || !valid) return res.status(401).json({ message: "Invalid email or password" });

  const token = jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: "7d" });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.get("/me", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: publicFields });
  res.json(user);
});

export default router;
