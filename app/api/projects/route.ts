import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    if (!username) {
      return NextResponse.json({ error: "Falta el nombre de usuario" }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email: username.toLowerCase() },
      include: {
        projects: {
          include: {
            sessions: {
              orderBy: { startedAt: "desc" },
              take: 1,
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      // Auto-create user to prevent 404 error if they bypassed register or have localStorage state
      user = await prisma.user.create({
        data: {
          email: username.toLowerCase(),
          name: username,
        },
        include: {
          projects: {
            include: {
              sessions: {
                orderBy: { startedAt: "desc" },
                take: 1,
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }

    // Map projects to ProjectSession client type
    const projectSessions = user.projects.map((p) => {
      const latestSession = p.sessions[0];
      return {
        id: p.id,
        name: p.name,
        feed: latestSession?.transcript ? (latestSession.transcript as any) : [],
        analysis: latestSession?.notes ? (latestSession.notes as any) : null,
        createdAt: p.createdAt,
      };
    });

    return NextResponse.json(projectSessions);
  } catch (error: any) {
    console.error("GET projects error:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, username } = await req.json();
    if (!name || !username) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email: username.toLowerCase() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: username.toLowerCase(),
          name: username,
        },
      });
    }

    // Create project and a default session for it
    const project = await prisma.project.create({
      data: {
        name,
        userId: user.id,
        sessions: {
          create: {
            title: "Sesión Inicial",
            transcript: [], // Empty feed initially
          },
        },
      },
      include: {
        sessions: true,
      },
    });

    const newProjectSession = {
      id: project.id,
      name: project.name,
      feed: [],
      analysis: null,
      createdAt: project.createdAt,
    };

    return NextResponse.json(newProjectSession);
  } catch (error: any) {
    console.error("POST project error:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
