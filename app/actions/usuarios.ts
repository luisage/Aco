"use server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Role = "SUPERADMIN" | "ADMIN" | "USER";

async function requireSuperadmin() {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") throw new Error("No autorizado");
}

export async function crearUsuario(data: {
  usuario: string;
  nombre?: string | null;
  apellido?: string | null;
  password: string;
  role: Role;
}) {
  await requireSuperadmin();
  const hashed = await hash(data.password, 12);
  return prisma.user.create({
    data: {
      usuario: data.usuario,
      nombre: data.nombre ?? null,
      apellido: data.apellido ?? null,
      password: hashed,
      role: data.role,
      estatus: true,
    },
  });
}

export async function editarUsuario(
  id: number,
  data: {
    usuario: string;
    nombre?: string | null;
    apellido?: string | null;
    role: Role;
    estatus: boolean;
    nuevaPassword?: string | null;
  }
) {
  await requireSuperadmin();
  const updateData: Record<string, unknown> = {
    usuario: data.usuario,
    nombre: data.nombre ?? null,
    apellido: data.apellido ?? null,
    role: data.role,
    estatus: data.estatus,
  };
  if (data.nuevaPassword) {
    updateData.password = await hash(data.nuevaPassword, 12);
  }
  return prisma.user.update({ where: { id }, data: updateData });
}
