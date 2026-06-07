import { NextResponse } from 'next/server';
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { email } = await req.json();

    if (email !== session.user.email) {
      return NextResponse.json({ message: "L'adresse email ne correspond pas." }, { status: 400 });
    }

    // Delete the user from the database
    // Because of Prisma relations (if any exist like VerificationToken or PasswordResetToken)
    // we should make sure we delete them or they cascade. Currently VerificationToken/PasswordResetToken
    // use email instead of foreign key so they won't restrict it, but it's good to clean them up.
    
    await prisma.verificationToken.deleteMany({
      where: { email: session.user.email }
    });

    await prisma.passwordResetToken.deleteMany({
      where: { email: session.user.email }
    });

    await prisma.user.delete({
      where: { email: session.user.email }
    });

    return NextResponse.json({ message: "Compte supprimé avec succès." }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la suppression du compte :", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la suppression de votre compte." },
      { status: 500 }
    );
  }
}
