import { NextResponse } from 'next/server';
import { prisma } from "../[...nextauth]/route";
import bcrypt from "bcryptjs";

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

    return NextResponse.json({ message: "Compte créé avec succès", user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du compte", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
