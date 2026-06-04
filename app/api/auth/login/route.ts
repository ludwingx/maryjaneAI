import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: username.toLowerCase() },
    });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: { id: user.id, username: user.email } });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
