import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: username.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        email: username.toLowerCase(),
        name: username,
        password: password,
      },
    });

    return NextResponse.json({ success: true, user: { id: user.id, username: user.email } });
  } catch (error: any) {
    console.error("Register API error:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
