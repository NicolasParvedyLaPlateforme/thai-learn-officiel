import { openGiftAction } from "@/actions/secureProgress";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";

// Mock next-auth
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("secureProgress actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("openGiftAction", () => {
    it("should return error if not logged in", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const result = await openGiftAction('learn');
      expect(result.success).toBe(false);
      expect(result.error).toBe("Non connecté");
    });

    it("should return error if user has no gifts available", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { email: "test@test.com" } });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        xp: 100,
        goldCoins: 10,
        progressData: { unopenedGifts: { learn: 0, alphabet: 0, speak: 0 } },
      });

      const result = await openGiftAction('learn');
      expect(result.success).toBe(false);
      expect(result.error).toBe("Aucun cadeau disponible");
    });

    it("should calculate xp and coins, decrement gift, and save to db", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { email: "test@test.com" } });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        xp: 100,
        goldCoins: 10,
        progressData: { unopenedGifts: { learn: 1, alphabet: 0, speak: 0 } },
      });
      (prisma.user.update as jest.Mock).mockImplementation(async (args) => {
        return {
          xp: 100 + (args.data.xp?.increment || 0),
          goldCoins: 10 + (args.data.goldCoins?.increment || 0),
          progressData: args.data.progressData,
        };
      });

      const result = await openGiftAction('learn');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.addedXp).toBeGreaterThanOrEqual(20);
        expect(result.data.addedXp).toBeLessThanOrEqual(300);
        expect(result.data.totalXp).toBe(100 + result.data.addedXp);
      }

      // Check if DB was updated correctly
      expect(prisma.user.update).toHaveBeenCalled();
      const updateCallArgs = (prisma.user.update as jest.Mock).mock.calls[0][0];
      
      expect(updateCallArgs.where.email).toBe("test@test.com");
      expect(updateCallArgs.data.progressData.unopenedGifts.learn).toBe(0);
    });
  });
});
