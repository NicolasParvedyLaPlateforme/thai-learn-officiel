"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { verifyNetworkSignature } from "@/lib/security";

export async function saveProgress(data: any, timestamp?: number, signature?: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { success: false, error: "Non connecté" };
  }

  try {
    // Si la sécurité anti-rejeu est fournie (pour prévenir les requêtes forgées)
    if (timestamp && signature) {
      if (!verifyNetworkSignature(data, timestamp, signature)) {
        return { success: false, error: "Signature invalide" };
      }

      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { progressData: true }
      });

      if (currentUser) {
        const currentProgress: any = currentUser.progressData || {};
        const lastSync = currentProgress.lastSyncTimestamp || 0;

        if (timestamp <= lastSync) {
          return { success: false, error: "Replay attack detected" };
        }
      }
    }

    const { xp, currentStreak, longestStreak, lastActiveDate, goldCoins, lastConversionMonth, ...restProgress } = data;
    
    if (timestamp) {
      restProgress.lastSyncTimestamp = timestamp;
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { progressData: true }
    });
    const currentProgressData = (currentUser?.progressData as any) || {};

    const updateData: any = {
      currentStreak: currentStreak || 0,
      longestStreak: longestStreak || 0,
      lastActiveDate: lastActiveDate || null,
      lastConversionMonth: lastConversionMonth || null,
      progressData: {
        ...currentProgressData,
        ...restProgress,
      },
    };

    if (xp !== undefined) updateData.xp = xp;
    if (goldCoins !== undefined) updateData.goldCoins = goldCoins;

    await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur saveProgress:", error);
    return { success: false, error: "Erreur lors de la sauvegarde" };
  }
}

export async function getProgress() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { success: false, error: "Non connecté" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        xp: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
        goldCoins: true,
        lastConversionMonth: true,
        progressData: true,
      }
    });

    if (!user) return { success: false, error: "Utilisateur non trouvé" };

    const data = {
      xp: user.xp,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastActiveDate: user.lastActiveDate,
      goldCoins: user.goldCoins,
      lastConversionMonth: user.lastConversionMonth,
      ...(typeof user.progressData === 'object' && user.progressData ? user.progressData : {})
    };

    return { success: true, data };
  } catch (error) {
    console.error("Erreur getProgress:", error);
    return { success: false, error: "Erreur lors de la récupération" };
  }
}
