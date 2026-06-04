"use server";

import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "../api/auth/[...nextauth]/route";

export async function saveProgress(data: any) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { success: false, error: "Non connecté" };
  }

  try {
    const { xp, currentStreak, longestStreak, lastActiveDate, ...restProgress } = data;

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        xp: xp || 0,
        currentStreak: currentStreak || 0,
        longestStreak: longestStreak || 0,
        lastActiveDate: lastActiveDate || null,
        progressData: restProgress,
      },
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
        progressData: true,
      }
    });

    if (!user) return { success: false, error: "Utilisateur non trouvé" };

    const data = {
      xp: user.xp,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastActiveDate: user.lastActiveDate,
      ...(typeof user.progressData === 'object' && user.progressData ? user.progressData : {})
    };

    return { success: true, data };
  } catch (error) {
    console.error("Erreur getProgress:", error);
    return { success: false, error: "Erreur lors de la récupération" };
  }
}
