import { NextRequest } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "Sin archivo" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "aco/alumnos", resource_type: "image" }, (error, res) => {
        if (error || !res) reject(error ?? new Error("Sin respuesta de Cloudinary"));
        else resolve(res);
      })
      .end(buffer);
  });

  return Response.json({ url: result.secure_url });
}
