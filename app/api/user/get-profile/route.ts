import { NextResponse } from 'next/server';
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { pseudo: true, name: true, emailVerified: true }
    });

    if (!user) {
      return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ 
      pseudo: user.pseudo || '',
      isEmailVerified: user.emailVerified !== null 
    }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
