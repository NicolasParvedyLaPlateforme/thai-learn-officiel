import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';

export default function InstructionExample({ typeKey, language }: { typeKey: string | null, language: string }) {
  if (typeKey === 'word-match') {
    return (
      <div className="flex flex-col items-center w-full gap-3 sm:gap-4 mt-2">
        <motion.div 
           initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
           className="text-xl sm:text-2xl font-bold text-slate-800">
           {language === 'en' ? 'cat' : 'chat'}
        </motion.div>
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
           className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
           <div className="p-3 sm:p-4 rounded-2xl border border-slate-200 text-slate-400 flex items-center justify-center bg-slate-50 opacity-60">
             <span className="font-thai text-xl">หมา</span>
           </div>
           <div className="p-3 sm:p-4 rounded-2xl border-b-4 border-2 border-emerald-500 text-emerald-700 bg-emerald-50 flex flex-col items-center justify-center relative transform ring-2 ring-emerald-500/20 ring-offset-1 scale-[1.02]">
             <span className="font-thai text-xl font-bold">แมว</span>
             <div className="absolute -top-3 -right-3 bg-emerald-500 text-white rounded-full p-1 shadow-md">
               <Check size={16} strokeWidth={4} />
             </div>
           </div>
           <div className="p-3 sm:p-4 rounded-2xl border border-slate-200 text-slate-400 flex items-center justify-center bg-slate-50 opacity-60">
             <span className="font-thai text-xl">นก</span>
           </div>
           <div className="p-3 sm:p-4 rounded-2xl border border-slate-200 text-slate-400 flex items-center justify-center bg-slate-50 opacity-60">
             <span className="font-thai text-xl">ปลา</span>
           </div>
        </motion.div>
        <motion.div 
           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
           className="text-sm font-medium text-slate-500 mt-2 text-center">
           <span className="font-bold text-slate-800">{language === 'en' ? 'cat' : 'chat'}</span> {language === 'en' ? 'translates to' : 'se traduit par'} <span className="font-bold text-emerald-600 font-thai text-base">แมว</span>
        </motion.div>
      </div>
    );
  }

  if (typeKey === 'sentence-builder') {
    return (
      <div className="flex flex-col items-center w-full gap-3 sm:gap-4 mt-2">
        <motion.div 
           initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
           className="text-xl sm:text-2xl font-bold text-slate-800">
           {language === 'en' ? 'I eat rice' : 'Je mange du riz'}
        </motion.div>
        
        {/* Selected options area */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
           className="flex flex-wrap gap-2 min-h-[3rem] sm:min-h-[3.5rem] p-2 sm:p-3 border-b-2 border-slate-200 w-full justify-center relative">
            <div className="px-3 sm:px-4 py-2 bg-emerald-50 border-2 border-emerald-500 text-emerald-700 rounded-xl font-thai text-lg font-bold shadow-sm ring-2 ring-emerald-500/20 ring-offset-1">ฉัน</div>
            <div className="px-3 sm:px-4 py-2 bg-emerald-50 border-2 border-emerald-500 text-emerald-700 rounded-xl font-thai text-lg font-bold shadow-sm ring-2 ring-emerald-500/20 ring-offset-1">กิน</div>
            <div className="px-3 sm:px-4 py-2 bg-emerald-50 border-2 border-emerald-500 text-emerald-700 rounded-xl font-thai text-lg font-bold shadow-sm ring-2 ring-emerald-500/20 ring-offset-1">ข้าว</div>
            <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-md">
               <Check size={16} strokeWidth={4} />
            </div>
        </motion.div>

        {/* Options pool */}
        <motion.div 
           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
           className="flex flex-wrap gap-2 justify-center mt-2 opacity-50">
            <div className="px-3 sm:px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-transparent">กิน</div>
            <div className="px-3 sm:px-4 py-2 bg-slate-50 border border-slate-200 text-slate-500 shadow-none rounded-xl font-thai text-lg">น้ำ</div>
            <div className="px-3 sm:px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-transparent">ข้าว</div>
        </motion.div>
        
        <motion.div 
           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
           className="text-sm font-medium text-slate-500 mt-2 text-center">
           {language === 'en' ? 'Build the sentence by clicking words in order:' : 'Construisez la phrase en cliquant sur les mots dans l\'ordre :'} 
           <br/>
           <span className="font-bold text-emerald-600 font-thai text-base mt-1 inline-block">ฉันกินข้าว</span>
        </motion.div>
      </div>
    );
  }

  if (typeKey === 'pair-matching') {
     return (
       <div className="w-full flex flex-col gap-3 sm:gap-4 mt-2">
          <motion.div 
             initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
             className="flex justify-between items-center w-full max-w-xs mx-auto gap-3 sm:gap-4">
             <div className="flex-1 p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-700 font-medium text-center relative tracking-wide">
                {language === 'en' ? 'cat' : 'chat'}
             </div>
             <div className="flex-1 p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-700 font-thai text-xl text-center font-bold relative">
                แมว
                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white rounded-full p-1 shadow-sm">
                   <Check size={16} strokeWidth={4} />
                </div>
             </div>
          </motion.div>
          <motion.div 
             initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
             className="flex justify-between items-center w-full max-w-xs mx-auto gap-4">
             <div className="flex-1 p-3 rounded-xl border-2 border-slate-200 bg-white text-slate-500 font-medium text-center tracking-wide">
                {language === 'en' ? 'dog' : 'chien'}
             </div>
             <div className="flex-1 p-3 rounded-xl border-2 border-slate-200 bg-white text-slate-500 font-thai text-xl text-center">
                หมา
             </div>
          </motion.div>
       </div>
     )
  }

  if (typeKey === 'writing' || typeKey === 'writing-blind') {
     return (
      <div className="flex flex-col items-center w-full gap-3 sm:gap-4 mt-2">
        <motion.div 
           initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
           className="text-xl sm:text-2xl font-bold text-slate-800">
           {language === 'en' ? 'I eat.' : 'Je mange.'}
        </motion.div>
        
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
           className="flex flex-row justify-center gap-1 sm:gap-2 w-full mt-2 flex-wrap">
			<div className="w-8 sm:w-10 h-12 sm:h-14 border-b-4 border-emerald-500 bg-emerald-50 rounded-md flex items-center justify-center font-thai text-xl font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-500/20">ฉ</div>
			<div className="w-8 sm:w-10 h-12 sm:h-14 border-b-4 border-emerald-500 bg-emerald-50 rounded-md flex items-center justify-center font-thai text-xl font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-500/20">ั</div>
			<div className="w-8 sm:w-10 h-12 sm:h-14 border-b-4 border-emerald-500 bg-emerald-50 rounded-md flex items-center justify-center font-thai text-xl font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-500/20">น</div>
			<div className="w-2 sm:w-4 h-12 sm:h-14"></div>
			<div className="w-8 sm:w-10 h-12 sm:h-14 border-b-4 border-emerald-500 bg-emerald-50 rounded-md flex items-center justify-center font-thai text-xl font-bold text-emerald-700 relative shadow-sm ring-1 ring-emerald-500/20">
                ก
                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white rounded-full p-1 shadow-md z-10">
                   <Check size={14} strokeWidth={4} />
                </div>
            </div>
            {/* The rest is blank empty or placeholder */}
			<div className="w-8 sm:w-10 h-12 sm:h-14 border-b-4 border-slate-200 bg-slate-100 rounded-md flex items-center justify-center opacity-60"></div>
			<div className="w-8 sm:w-10 h-12 sm:h-14 border-b-4 border-slate-200 bg-slate-100 rounded-md flex items-center justify-center opacity-60"></div>
        </motion.div>
        
        <motion.div 
           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
           className="text-sm font-medium text-slate-500 mt-2 text-center">
           {language === 'en' ? 'Type the translation exactly:' : 'Tapez la traduction exacte :'} 
           <br/>
           <span className="font-bold text-emerald-600 font-thai text-base mt-1 inline-block">ฉันกิน</span>
        </motion.div>
      </div>
     )
  }
  
  if (typeKey === 'free-typing') {
      return (
      <div className="flex flex-col items-center w-full gap-3 sm:gap-4 mt-2">
        <motion.div 
           initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
           className="text-xl sm:text-2xl font-bold text-slate-800">
           {language === 'en' ? 'cat' : 'chat'}
        </motion.div>
        
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
           className="w-full relative px-2 sm:px-4">
            <div className="w-full p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 text-emerald-700 font-thai text-2xl text-center font-bold outline-none shadow-sm ring-2 ring-emerald-500/20 ring-offset-2">
                แมว
            </div>
            <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 bg-emerald-500 text-white rounded-full p-1 shadow-md">
               <Check size={20} strokeWidth={3} />
            </div>
        </motion.div>
        
        <motion.div 
           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
           className="text-sm font-medium text-slate-500 mt-2 text-center">
           {language === 'en' ? 'Type the translation directly using your keyboard:' : 'Tapez la traduction directement avec votre clavier :'} 
           <br/>
           <span className="font-bold text-emerald-600 font-thai text-base mt-1 inline-block">แมว</span>
        </motion.div>
      </div>
      );
  }

  // Fallback
  return null;
}
