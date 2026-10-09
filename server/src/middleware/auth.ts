import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { config } from "../config";
import { prisma } from "../db";

export interface AuthUser {
  id: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const CACHE_MS = 15_000;
const userCache = new Map<string, { user: AuthUser | null; expires: number }>();
export const forgetUser = (id: string) => userCache.delete(id);

async function loadUser(id: string): Promise<AuthUser | null> {
  const hit = userCache.get(id);
  if (hit && hit.expires > Date.now()) return hit.user;
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  userCache.set(id, { user, expires: Date.now() + CACHE_MS });
  return user;
}


export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as jwt.JwtPayload;
    const user = await loadUser(String(payload.sub));
    if (!user) return res.status(401).json({ message: "User no longer exists" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export const authorize =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to perform this action" });
    }
    next();
  };
