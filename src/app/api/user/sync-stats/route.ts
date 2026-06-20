import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyNetworkSignature } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Non connecté" });
    }
    
    const body = await req.json();
    const { payload, timestamp, signature } = body;
    
    if (!payload || !timestamp || !signature) {
      return NextResponse.json({ success: false, error: "Requête invalide" }, { status: 400 });
    }

    // 1. Vérification de la signature
    if (!verifyNetworkSignature(payload, timestamp, signature)) {
      return NextResponse.json({ success: false, error: "Signature invalide" }, { status: 403 });
    }

    // 2. Vérification Anti-Rejeu (Timestamp)
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { progressData: true }
    });

    if (!currentUser) {
      return NextResponse.json({ success: false, error: "Utilisateur non trouvé" });
    }

    const progressData: any = currentUser.progressData || {};
    const lastSync = progressData.lastSyncTimestamp || 0;

    if (timestamp <= lastSync) {
      return NextResponse.json({ success: false, error: "Replay attack detected" }, { status: 403 });
    }

    // 3. Mise à jour des statistiques
    const { xpAmount, goldAmount } = payload;
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

    progressData.lastSyncTimestamp = timestamp;
    data.progressData = progressData;

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data,
      select: {
        xp: true,
        goldCoins: true
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      newXp: updatedUser.xp, 
      newGoldCoins: updatedUser.goldCoins 
    });
  } catch (error) {
    console.error("Erreur sync-stats:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" });
  }
}
