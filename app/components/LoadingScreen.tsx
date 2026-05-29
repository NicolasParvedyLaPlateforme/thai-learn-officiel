import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useProgressStore } from "../lib/store";

export function LoadingScreen({ isLoadingData, onReady }: { isLoadingData: boolean; onReady: () => void }) {
  const [progress, setProgress] = useState(0);
  const language = useProgressStore(state => state.language);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoadingData) {
      timer = setInterval(() => {
        setProgress(p => {
          if (p >= 85) {
            clearInterval(timer);
            return 85;
          }
          return p + (Math.random() * 5 + 2); 
        });
      }, 50);
    } else {
      timer = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
             clearInterval(timer);
             setTimeout(onReady, 200); 
             return 100;
          }
          return p + 15;
        });
      }, 30);
    }
    return () => clearInterval(timer);
  }, [isLoadingData, onReady]);

  return (
    <motion.div 
      key="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAFAFA] z-50 flex-1"
    >
       <motion.div
         initial={{ scale: 0.8, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.3 } }}
         transition={{ duration: 0.4 }}
         className="flex flex-col items-center"
       >
         <div className="animate-pulse text-sm text-slate-400 mb-2 uppercase tracking-widest font-semibold flex items-center gap-2">
            {isLoadingData ? (
              <>
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </>
            ) : (language === 'en' ? "Ready!" : "Prêt !")}
         </div>
         <div className="text-6xl font-extrabold text-slate-800 tracking-tighter w-36 justify-center flex font-mono border-b-2 border-indigo-100 pb-2">
            {Math.min(100, Math.floor(progress))}
            <span className="text-4xl text-slate-400 mt-1 ml-1">%</span>
         </div>
         <div className="w-64 h-2 bg-slate-200 rounded-full mt-8 shadow-inner overflow-hidden relative">
           <motion.div 
             className="absolute top-0 left-0 bottom-0 bg-indigo-500 rounded-full"
             animate={{ width: `${Math.min(100, progress)}%` }}
             transition={{ ease: "easeOut", duration: 0.1 }}
           />
         </div>
       </motion.div>
    </motion.div>
  );
}
