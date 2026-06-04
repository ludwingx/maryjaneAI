import { prisma } from "../lib/db";

async function main() {
  console.log("--- PROBANDO CONEXIÓN A BASE DE DATOS ---");
  try {
    const users = await prisma.user.findMany({
      include: {
        projects: {
          include: {
            sessions: true,
          }
        }
      }
    });
    console.log("Usuarios en la base de datos:", JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
  }
}

main().catch(console.error);
