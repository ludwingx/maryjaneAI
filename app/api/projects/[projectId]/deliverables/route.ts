import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    if (!projectId) {
      return NextResponse.json({ error: "Falta el ID del proyecto" }, { status: 400 });
    }

    const deliverables = await prisma.deliverable.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(deliverables);
  } catch (error: any) {
    console.error("GET deliverables error:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { type, title, content } = await req.json();

    if (!projectId || !type || !title || !content) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    // Upsert deliverable: we can update if a deliverable of this type already exists, or create a new one.
    // For simplicity, we search if there is an existing deliverable of this type for the project, and update it.
    const existing = await prisma.deliverable.findFirst({
      where: { projectId, type },
    });

    let deliverable;
    if (existing) {
      deliverable = await prisma.deliverable.update({
        where: { id: existing.id },
        data: {
          title,
          content,
        },
      });
    } else {
      deliverable = await prisma.deliverable.create({
        data: {
          projectId,
          type,
          title,
          content,
        },
      });
    }

    return NextResponse.json(deliverable);
  } catch (error: any) {
    console.error("POST deliverable error:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
