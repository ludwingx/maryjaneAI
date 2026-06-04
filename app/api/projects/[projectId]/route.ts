import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    if (!projectId) {
      return NextResponse.json({ error: "Falta el ID del proyecto" }, { status: 400 });
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE project error:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { name } = await req.json();
    if (!projectId || !name) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    // Find a user to assign the project to if we are creating it
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: "admin", name: "admin" }
      });
    }

    const updated = await prisma.project.upsert({
      where: { id: projectId },
      update: { name },
      create: {
        id: projectId,
        name,
        userId: user.id,
        sessions: {
          create: {
            title: "Sesión Inicial",
            transcript: [],
          }
        }
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH project error:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
