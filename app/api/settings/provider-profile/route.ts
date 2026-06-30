import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/settings/provider-profile?username=<email>
export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get("username");
    if (!username) {
      return Response.json({ error: "Username required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: username } });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const profile = await prisma.providerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      // Return defaults (no profile saved yet)
      return Response.json(null);
    }

    return Response.json(profile);
  } catch (error) {
    console.error("Error loading provider profile:", error);
    return Response.json(
      { error: "Failed to load provider profile" },
      { status: 500 }
    );
  }
}

// POST /api/settings/provider-profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, ...profileData } = body;

    if (!username) {
      return Response.json({ error: "Username required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: username } });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Upsert: create if not exists, update if exists
    const profile = await prisma.providerProfile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: {
        userId: user.id,
        ...profileData,
      },
    });

    return Response.json(profile);
  } catch (error) {
    console.error("Error saving provider profile:", error);
    return Response.json(
      { error: "Failed to save provider profile" },
      { status: 500 }
    );
  }
}
