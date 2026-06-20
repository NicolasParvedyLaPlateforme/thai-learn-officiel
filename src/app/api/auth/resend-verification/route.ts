import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { language = 'fr' } = await req.json().catch(() => ({}));

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, emailVerified: true }
    });

    if (!user) {
      return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Votre email est déjà vérifié" }, { status: 400 });
    }

    if (!user.email) {
      return NextResponse.json({ message: "L'utilisateur n'a pas d'adresse email valide" }, { status: 400 });
    }

    // Generate token
    const token = uuidv4();
    
    // Save token or update if existing for this email
    // Prisma `VerificationToken` has @@unique([email, token]), but wait, token is unique too.
    // It's better to just create a new one, as old tokens expire.
    await prisma.verificationToken.create({
      data: {
        email: user.email,
        token,
        expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24), // 24 hours
      }
    });

    await sendVerificationEmail(user.email, token, language);

    return NextResponse.json({ message: "Email de vérification envoyé avec succès" }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de vérification", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
