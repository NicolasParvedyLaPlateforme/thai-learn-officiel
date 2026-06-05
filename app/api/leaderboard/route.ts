import { NextResponse } from 'next/server';
import { prisma } from "@/app/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 50;

    const topUsers = await prisma.user.findMany({
      where: {
        xp: {
          gt: 0
        }
      },
      orderBy: {
        xp: 'desc'
      },
      take: limit,
      select: {
        id: true,
        name: true,
        pseudo: true,
        xp: true,
        image: true
      }
    });

    // Ensure all users have a display pseudo even if not in DB
    const usersWithPseudo = topUsers.map((user, index) => {
      let displayPseudo = user.pseudo;
      if (!displayPseudo) {
        const base = user.name ? user.name.charAt(0).toUpperCase() : 'U';
        // We use a deterministic but random-looking number based on the ID or index to avoid changing on every refresh
        const fallbackNum = parseInt(user.id.substring(0, 5), 16) % 90000 + 10000;
        displayPseudo = `${base}-${fallbackNum}`;
      }
      return {
        ...user,
        pseudo: displayPseudo,
        rank: index + 1
      };
    });

    return NextResponse.json(usersWithPseudo);
  } catch (error) {
    console.error("Erreur lors de la récupération du classement", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
