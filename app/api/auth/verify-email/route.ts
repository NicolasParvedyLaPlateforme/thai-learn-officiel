import { NextResponse } from "next/server";
import { prisma } from "../[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ message: "Token manquant" }, { status: 400 });
    }

    const existingToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!existingToken) {
      return NextResponse.json({ message: "Lien invalide ou expiré" }, { status: 400 });
    }

    if (new Date(existingToken.expires) < new Date()) {
      return NextResponse.json({ message: "Ce lien a expiré" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: existingToken.email }
    });

    if (!existingUser) {
      return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        emailVerified: new Date(),
      }
    });

    await prisma.verificationToken.delete({
      where: { id: existingToken.id }
    });

    // Redirige l'utilisateur vers son profil ou la page d'accueil avec un paramètre de succès
    return NextResponse.redirect(new URL("/profile?verified=true", req.url));

  } catch (error) {
    console.error("Erreur verify email", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
