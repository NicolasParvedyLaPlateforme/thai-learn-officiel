"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function openGiftAction(category: 'learn' | 'alphabet' | 'speak') {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, error: "Non connecté" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { xp: true, goldCoins: true, progressData: true }
    });

    if (!user) return { success: false, error: "Utilisateur non trouvé" };

    const progressData = (user.progressData as any) || {};
    const unopenedGifts = progressData.unopenedGifts || { learn: 0, alphabet: 0, speak: 0 };
    
    if (!unopenedGifts[category] || unopenedGifts[category] <= 0) {
      return { success: false, error: "Aucun cadeau disponible" };
    }

    // Décrémenter le cadeau
    unopenedGifts[category] -= 1;
    progressData.unopenedGifts = unopenedGifts;

    // Logique de cadeau
    const r1 = Math.random();
    let xpAmount = 20;
    if (r1 < 0.60) {
      xpAmount = Math.floor(20 + Math.random() * 30); // 20-49 XP (60%)
    } else if (r1 < 0.90) {
      xpAmount = Math.floor(50 + Math.random() * 100); // 50-149 XP (30%)
    } else {
      xpAmount = Math.floor(150 + Math.random() * 150); // 150-299 XP (10%)
    }
    
    const r2 = Math.random();
    const getsCoins = r2 < 0.20;
    const coinsAmount = getsCoins ? Math.floor(Math.random() * 3) + 1 : 0;

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        xp: { increment: xpAmount },
        goldCoins: { increment: coinsAmount },
        progressData: progressData
      }
    });

    return { 
      success: true, 
      data: {
        addedXp: xpAmount,
        addedCoins: coinsAmount,
        totalXp: updatedUser.xp,
        totalCoins: updatedUser.goldCoins
      } 
    };
  } catch (error) {
    console.error("Erreur openGiftAction:", error);
    return { success: false, error: "Erreur lors de l'ouverture du cadeau" };
  }
}

export async function completeLessonAction(
  lessonId: string, 
  levelIndex: number, 
  isBilan: boolean, 
  isPart: boolean = false, 
  isFullLongLevel: boolean = false, 
  partIndex: number | null = null,
  earnedStars: number = 3
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, error: "Non connecté" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { xp: true, progressData: true }
    });

    if (!user) return { success: false, error: "Utilisateur non trouvé" };

    const progressData = (user.progressData as any) || {};
    
    // Simulate getLocalDateString
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const today = `${y}-${m}-${d}`;

    const questsDate = progressData.questsDate;
    const completedToday = questsDate === today ? (progressData.completedToday || []) : [];

    // On the server, we need to import or duplicate calculateExpectedXp logic.
    // For now, let's calculate it directly here since we can't easily import from lib (it might contain browser-only code, though xp-utils is pure).
    
    // Using calculateExpectedXp logic:
    let isFirstTime = false;
    let xp = 0;
    let key = '';

    if (lessonId.startsWith('detective_')) {
       key = lessonId;
       isFirstTime = !completedToday.includes(key);
       xp = isFirstTime ? 50 : 20;
    } else if (lessonId.startsWith('speak_')) {
       key = `${lessonId}_level-${levelIndex}`;
       if (isPart) {
          key += (partIndex !== null ? `_part_${partIndex}` : `_part`);
       }
       isFirstTime = !completedToday.includes(key);
       if (isFullLongLevel) { xp = isFirstTime ? 500 : 100; } 
       else if (isPart) { xp = isFirstTime ? 50 : 10; } 
       else {
          if (levelIndex === 0) xp = isFirstTime ? 50 : 15;
          else if (levelIndex === 1) xp = isFirstTime ? 100 : 30;
          else if (levelIndex === 2) xp = isFirstTime ? 100 : 30;
          else if (levelIndex === 3) xp = isFirstTime ? 150 : 45;
          else if (levelIndex === 4) xp = isFirstTime ? 300 : 90;
          else xp = isFirstTime ? 50 : 15;
       }
    } else if (levelIndex === 10) {
       key = `learn_${lessonId}_level-10`;
       isFirstTime = !completedToday.includes(key);
       xp = isFirstTime ? 1000 : 200;
    } else if (isBilan) {
       key = `learn_${lessonId}_level-${levelIndex}`;
       isFirstTime = !completedToday.includes(key);
       xp = isFirstTime ? 50 : 25;
    } else {
       const type = (lessonId.startsWith('alphabet_') || lessonId.startsWith('alpha-')) ? 'alphabet' : 'learn';
       key = `${type}_${lessonId}_level-${levelIndex}`;
       if (isPart) {
          key += (partIndex !== null ? `_part_${partIndex}` : `_part`);
       }
       isFirstTime = !completedToday.includes(key);
       if (type === 'learn') {
          if (isPart) {
             if (levelIndex <= 6) xp = isFirstTime ? 10 : 5;
             else if (levelIndex === 7) xp = isFirstTime ? 20 : 5;
             else if (levelIndex === 8) xp = isFirstTime ? 30 : 5;
             else if (levelIndex === 9) xp = isFirstTime ? 50 : 5;
             else xp = isFirstTime ? 10 : 5;
          } else {
             if (levelIndex <= 6) xp = isFirstTime ? 30 : 5;
             else if (levelIndex === 7) xp = isFirstTime ? 50 : 5;
             else if (levelIndex === 8) xp = isFirstTime ? 100 : 25;
             else if (levelIndex === 9) xp = isFirstTime ? 300 : 50;
             else xp = isFirstTime ? 30 : 5;
          }
       } else {
          xp = isPart ? (isFirstTime ? 10 : 5) : (isFirstTime ? 30 : 5);
       }
    }

    if (xp > 0) {
       const updatedUser = await prisma.user.update({
         where: { email: session.user.email },
         data: { xp: { increment: xp } }
       });
       return { success: true, data: { addedXp: xp, totalXp: updatedUser.xp, isFirstTime, key } };
    }

    return { success: true, data: { addedXp: 0, totalXp: user.xp, isFirstTime, key } };
  } catch (error) {
    console.error("Erreur completeLessonAction:", error);
    return { success: false, error: "Erreur lors de la complétion de la leçon" };
  }
}
export async function claimQuestAction(category: 'learn' | 'alphabet' | 'speak', questIds: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, error: "Non connecté" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { xp: true, progressData: true }
    });

    if (!user) return { success: false, error: "Utilisateur non trouvé" };

    const progressData = (user.progressData as any) || {};
    const dailyQuests = progressData.dailyQuests || {};
    const categoryQuests = dailyQuests[category] || [];
    
    let earnedXp = 0;
    let earnedGifts = 0;
    let updated = false;

    // We trust the client's progress for now, but we verify the quest is marked completed
    // and hasn't been claimed yet.
    // Wait, the client just marked it completed. But we need to make sure we don't double claim.
    // We can add a `claimed: true` to the quest on the server!
    
    const updatedCategoryQuests = categoryQuests.map((q: any) => {
      if (questIds.includes(q.id) && !q.claimed) {
        earnedXp += (q.rewardXp || 0);
        earnedGifts += 1;
        updated = true;
        // On force completed: true au cas où le SyncProgress n'aurait pas encore sauvegardé cet état
        return { ...q, completed: true, claimed: true };
      }
      return q;
    });

    if (!updated) {
      return { success: false, error: "Aucune quête valide à réclamer" };
    }

    dailyQuests[category] = updatedCategoryQuests;
    progressData.dailyQuests = dailyQuests;

    const unopenedGifts = progressData.unopenedGifts || { learn: 0, alphabet: 0, speak: 0 };
    unopenedGifts[category] = (unopenedGifts[category] || 0) + earnedGifts;
    progressData.unopenedGifts = unopenedGifts;

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        xp: { increment: earnedXp },
        progressData
      }
    });

    return { 
      success: true, 
      data: { 
        addedXp: earnedXp, 
        addedGifts: earnedGifts,
        totalXp: updatedUser.xp,
        totalGifts: unopenedGifts[category]
      } 
    };
  } catch (error) {
    console.error("Erreur claimQuestAction:", error);
    return { success: false, error: "Erreur lors de la réclamation de la quête" };
  }
}

export async function syncXpAction(amount: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, error: "Non connecté" };
  }

  if (amount <= 0 || amount > 5000) {
    return { success: false, error: "Montant invalide" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { xp: true }
    });

    if (!user) return { success: false, error: "Utilisateur non trouvé" };

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { xp: { increment: amount } }
    });

    return { 
      success: true, 
      data: { 
        addedXp: amount,
        totalXp: updatedUser.xp
      } 
    };
  } catch (error) {
    console.error("Erreur syncXpAction:", error);
    return { success: false, error: "Erreur lors de la synchronisation de l'XP" };
  }
}

