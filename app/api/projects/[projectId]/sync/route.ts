import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { feed, analysis } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: "Falta el ID del proyecto" }, { status: 400 });
    }

    // Ensure the project exists in the database
    let project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      let user = await prisma.user.findFirst();
      if (!user) {
        user = await prisma.user.create({
          data: { email: "admin", name: "admin" }
        });
      }
      project = await prisma.project.create({
        data: {
          id: projectId,
          name: "Proyecto Alpha",
          userId: user.id,
        }
      });
    }

    // Find the latest session
    let session = await prisma.session.findFirst({
      where: { projectId },
      orderBy: { startedAt: "desc" },
    });

    if (!session) {
      // Create session if it doesn't exist
      session = await prisma.session.create({
        data: {
          projectId,
          title: "Sesión de Requerimientos",
        },
      });
    }

    // Update session transcript and notes
    session = await prisma.session.update({
      where: { id: session.id },
      data: {
        transcript: feed || [],
        notes: analysis || null,
      },
    });

    // Sync Requirements to the DB table
    if (analysis && Array.isArray(analysis.requirements)) {
      // Clear old requirements for this session
      await prisma.requirement.deleteMany({
        where: { sessionId: session.id },
      });

      // Insert new ones
      if (analysis.requirements.length > 0) {
        await prisma.requirement.createMany({
          data: analysis.requirements.map((reqItem: any) => ({
            sessionId: session.id,
            title: reqItem.description.slice(0, 100) || "Requerimiento",
            content: reqItem.description,
            type: reqItem.type || "FUNCTIONAL",
            category: reqItem.category || "General",
          })),
        });
      }
    }

    // Sync AISuggestions to the DB table
    if (analysis && Array.isArray(analysis.suggested_questions)) {
      // Clear old suggestions
      await prisma.aISuggestion.deleteMany({
        where: { sessionId: session.id },
      });

      // Insert new ones
      if (analysis.suggested_questions.length > 0) {
        await prisma.aISuggestion.createMany({
          data: analysis.suggested_questions.map((sugItem: any) => ({
            sessionId: session.id,
            question: sugItem.question,
            reason: `Categoría: ${sugItem.category || "General"}, Prioridad: ${sugItem.priority || "media"}`,
            category: sugItem.category || "General",
            resolved: false,
          })),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Sync project error:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
