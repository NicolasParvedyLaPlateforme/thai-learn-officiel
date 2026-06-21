import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Données manquantes" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: "Le mot de passe doit faire au moins 6 caractères" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || !user.password) {
      return NextResponse.json({ message: "Compte invalide" }, { status: 400 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      return NextResponse.json({ message: "Mot de passe actuel incorrect" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ message: "Mot de passe mis à jour" }, { status: 200 });
  } catch (error) {
    console.error("Erreur update password", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
