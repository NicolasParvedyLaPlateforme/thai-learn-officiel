import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Non connecté" });
    }
    
    const { xpAmount, goldAmount } = await req.json();
    
    const data: any = {};
    if (xpAmount && xpAmount > 0) {
      data.xp = { increment: xpAmount };
    }
    if (goldAmount && goldAmount > 0) {
      data.goldCoins = { increment: goldAmount };
    }
    
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: "Aucun montant à ajouter" });
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data,
      select: {
        xp: true,
        goldCoins: true
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      newXp: user.xp, 
      newGoldCoins: user.goldCoins 
    });
  } catch (error) {
    console.error("Erreur sync-stats:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" });
  }
}
