import { NextResponse } from 'next/server';
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { pseudo } = await req.json();

    if (!pseudo || pseudo.trim() === "") {
      return NextResponse.json({ message: "Le pseudo ne peut pas être vide" }, { status: 400 });
    }

    // Check if pseudo already exists (but ignore if it's the current user's pseudo)
    const existingUser = await prisma.user.findFirst({
      where: { 
        pseudo,
        NOT: {
          email: session.user.email
        }
      }
    });

    if (existingUser) {
      return NextResponse.json({ message: "Ce pseudo est déjà utilisé" }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { pseudo }
    });

    return NextResponse.json({ message: "Pseudo mis à jour avec succès", pseudo }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du pseudo", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
