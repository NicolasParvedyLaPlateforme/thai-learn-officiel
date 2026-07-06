import React from 'react';
import { m as motion, AnimatePresence } from "motion/react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

interface ExerciseLayoutProps {
    isDataLoaded: boolean;
    showExerciseUI: boolean;
    onReady: () => void;
    children: React.ReactNode;
}

export default function ExerciseLayout({
    isDataLoaded,
    showExerciseUI,
    onReady,
    children
}: ExerciseLayoutProps) {
    return (
        <div className="h-[100dvh] flex flex-col bg-[#FAFAFA] font-sans text-slate-800 overflow-hidden relative">
            <AnimatePresence mode="wait">
                {!showExerciseUI ? (
                    <LoadingScreen
                        key="loading-screen"
                        isLoadingData={!isDataLoaded}
                        onReady={onReady}
                    />
                ) : (
                    <motion.div
                        key="exercise-ui"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="flex-1 flex flex-col h-full w-full absolute inset-0"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}