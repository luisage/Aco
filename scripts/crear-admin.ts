/**
 * Ejecutar con: npx tsx scripts/crear-admin.ts
 * Crea el usuario administrador inicial en la base de datos.
 */
import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const usuario = "admin";
  const password = "admin123";
  const hashedPassword = await hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { usuario } });
  if (existing) {
    console.log(`El usuario "${usuario}" ya existe.`);
    return;
  }

  const user = await prisma.user.create({
    data: {
      usuario,
      password: hashedPassword,
      nombre: "Administrador",
      apellido: "ACO",
      role: "SUPERADMIN",
    },
  });

  console.log(`✅ Usuario creado: ${user.usuario} (ID: ${user.id})`);
  console.log(`   Contraseña inicial: ${password}`);
  console.log(`   ⚠️  Cámbiala después de tu primer inicio de sesión.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
