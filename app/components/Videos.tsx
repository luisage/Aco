import { prisma } from "@/lib/prisma";
import VideosClient from "./VideosClient";

export default async function Videos() {
  let videos: { id: number; nombre: string | null; descripcion: string | null; url: string; publicId: string }[] = [];
  try {
    videos = await prisma.videos.findMany({
      where: { estatus: true },
      orderBy: [{ orden: "asc" }, { creadoEn: "desc" }],
      select: { id: true, nombre: true, descripcion: true, url: true, publicId: true },
    });
  } catch {
    return null;
  }

  if (videos.length === 0) return null;

  return <VideosClient videos={videos} />;
}
