export const triggerConfetti = () => {
    import("canvas-confetti").then((mod) => {
        const confetti = mod.default;
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    });
};