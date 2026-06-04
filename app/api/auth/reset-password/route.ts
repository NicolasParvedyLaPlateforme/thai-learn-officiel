import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: "Données invalides" }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!resetToken) {
      return NextResponse.json({ message: "Jeton invalide ou expiré" }, { status: 400 });
    }

    if (new Date(resetToken.expires) < new Date()) {
      return NextResponse.json({ message: "Ce jeton a expiré" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword }
    });

    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    });

    return NextResponse.json({ message: "Mot de passe mis à jour" }, { status: 200 });
  } catch (error) {
    console.error("Erreur reset password", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
