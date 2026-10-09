import { config } from "./config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import authRouter from "./routes/auth";
import tasksRouter from "./routes/tasks";
import usersRouter from "./routes/users";

const app = express();
app.use(cors({ origin: config.clientUrl }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/users", usersRouter);

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: err.issues[0]?.message ?? "Validation failed",
      errors: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return res.status(409).json({ message: "Email is already in use" });
    if (err.code === "P2025") return res.status(404).json({ message: "Record not found" });
  }
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(config.port, () => console.log(`API running on port ${config.port}`));
