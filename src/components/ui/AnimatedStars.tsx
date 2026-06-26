import { m as motion } from "framer-motion";
import { Star } from "lucide-react";

interface AnimatedStarsProps {
  earnedStars: number;
}

export function AnimatedStars({ earnedStars }: AnimatedStarsProps) {
  return (
    <div className="flex gap-2 mb-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 200 }}
        >
          <Star
            size={48}
            className={
              i < earnedStars
                ? "fill-amber-400 text-amber-500"
                : "fill-slate-200 text-slate-300 drop-shadow-sm"
            }
          />
        </motion.div>
      ))}
    </div>
  );
}
