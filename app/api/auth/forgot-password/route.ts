import { NextResponse } from "next/server";
import { prisma } from "../[...nextauth]/route";
import { v4 as uuidv4 } from "uuid";
import { sendPasswordResetEmail } from "@/app/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Ne pas révéler si l'utilisateur existe ou non par sécurité
    if (!user) {
      return NextResponse.json({ message: "Si un compte existe, un email a été envoyé." }, { status: 200 });
    }

    const token = uuidv4();
    
    // Supprimer les anciens tokens pour cet email
    await prisma.passwordResetToken.deleteMany({
      where: { email }
    });

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires: new Date(new Date().getTime() + 1000 * 60 * 60), // 1 hour
      }
    });

    await sendPasswordResetEmail(email, token);

    return NextResponse.json({ message: "Si un compte existe, un email a été envoyé." }, { status: 200 });
  } catch (error) {
    console.error("Erreur forgot password", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
