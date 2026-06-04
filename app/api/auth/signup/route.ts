import { NextResponse } from 'next/server';
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/app/lib/mail";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email et mot de passe requis" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ message: "Cet email est déjà utilisé" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name || email.split("@")[0],
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

    await sendVerificationEmail(email, token);

    return NextResponse.json({ message: "Compte créé avec succès", user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du compte", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
