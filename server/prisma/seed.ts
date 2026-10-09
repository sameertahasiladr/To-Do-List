import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const accounts = [
    { name: "Admin", email: "admin@gmail.com", password: "Admin@123", role: "ADMIN" as const },
    { name: "Demo User", email: "user@gmail.com", password: "User@123", role: "USER" as const },
  ];
  for (const a of accounts) {
    await prisma.user.upsert({
      where: { email: a.email },
      update: {},
      create: {
        name: a.name,
        email: a.email,
        role: a.role,
        passwordHash: await bcrypt.hash(a.password, 10),
      },
    });
  }
  console.log("Seeded: admin@gmail.com / Admin@123, user@gmail.com / User@123");
}

main().finally(() => prisma.$disconnect());
