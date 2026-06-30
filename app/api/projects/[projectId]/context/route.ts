import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/projects/[projectId]/context
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    const context = await prisma.projectContext.findUnique({
      where: { projectId },
    });

    if (!context) {
      return Response.json(null);
    }

    return Response.json(context);
  } catch (error) {
    console.error("Error loading project context:", error);
    return Response.json(
      { error: "Failed to load project context" },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/context
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    // Upsert: create if not exists, update if exists
    const context = await prisma.projectContext.upsert({
      where: { projectId },
      update: body,
      create: {
        projectId,
        ...body,
      },
    });

    return Response.json(context);
  } catch (error) {
    console.error("Error saving project context:", error);
    return Response.json(
      { error: "Failed to save project context" },
      { status: 500 }
    );
  }
}
