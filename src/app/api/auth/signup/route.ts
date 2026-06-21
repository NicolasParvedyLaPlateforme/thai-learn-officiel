import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { name, email, password, language } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ message: "Email et mot de passe requis" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ message: "Cet email est déjà utilisé" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const baseName = name || email.split("@")[0];
    const pseudoBase = baseName.charAt(0).toUpperCase();
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const generatedPseudo = `${pseudoBase}-${randomDigits}`;

    const user = await prisma.user.create({
      data: {
        name: baseName,
        pseudo: generatedPseudo,
        email,
        password: hashedPassword,
      }
    });

    const token = uuidv4();
    await prisma.verificationToken.create({
      data: {
        email,
        token,
        expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24), // 24 hours
      }
    });

    await sendVerificationEmail(email, token, language);

    return NextResponse.json({ message: "Compte créé avec succès", user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du compte", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
