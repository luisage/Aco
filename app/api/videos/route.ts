import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const param = req.nextUrl.searchParams.get("estatus");
  const estatus = param === null ? undefined : param === "true";

  const videos = await prisma.videos.findMany({
    where: estatus === undefined ? undefined : { estatus },
    orderBy: [{ orden: "asc" }, { creadoEn: "desc" }],
  });

  return Response.json(videos);
}
