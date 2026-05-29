import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlphabetItem } from '../lib/alphabet-data';
import { formatCombiningChar } from '../lib/alphabet-utils';
import { Volume2 } from 'lucide-react';
import { useProgressStore } from '../lib/store';

interface AlphabetCardProps {
  item: AlphabetItem;
  onPlayAudio?: () => void;
  minimal?: boolean;
}

export function AlphabetCard({ item, onPlayAudio, minimal }: AlphabetCardProps) {
  const language = useProgressStore((state) => state.language);
  const [isFlipped, setIsFlipped] = useState(false);

  // Color coding based on consonant class
  const getClassColors = () => {
    if (item.type === 'vowel') return { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' };
    
    switch (item.consonantClass) {
      case 'low': return { bg: 'bg-blue-100', text: 'text-blue-500', border: 'border-blue-200', label: 'Low Class' };
      case 'mid': return { bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-200', label: 'Mid Class' };
      case 'high': return { bg: 'bg-orange-100', text: 'text-orange-500', border: 'border-orange-200', label: 'High Class' };
      default: return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
    }
  };

  const colors = getClassColors();
  const hintText = language === 'en' ? item.mnemonicHintEn : item.mnemonicHintFr;

  const displayLetter = formatCombiningChar(item.letter);

  if (minimal) {
    return (
      <div 
        className={`w-32 h-32 rounded-3xl border-2 ${colors.border} ${colors.bg} shadow-sm flex flex-col items-center justify-center p-2 relative group`}
        onClick={onPlayAudio}
      >
        <span className={`text-6xl font-medium ${colors.text} drop-shadow-sm font-thai`}>{displayLetter}</span>
        {onPlayAudio && (
          <div className="absolute top-2 right-2 text-current opacity-50 group-hover:opacity-100 transition-opacity">
            <Volume2 size={16} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="w-64 h-64 relative cursor-pointer font-thai"
      style={{ perspective: '1000px' }}
      onClick={() => {
        setIsFlipped(!isFlipped);
        if (!isFlipped && onPlayAudio) {
          onPlayAudio();
        }
      }}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
      >
        {/* Front of the card: Mnemonic Side */}
        <div 
          className={`absolute inset-0 w-full h-full rounded-3xl border-2 ${colors.border} ${colors.bg} shadow-sm overflow-hidden flex flex-col items-center justify-center p-4`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {item.consonantClass && (
             <div className={`absolute top-3 left-0 right-0 text-center text-xs font-bold uppercase tracking-wider ${colors.text} opacity-80 font-sans`}>
                {item.consonantClass} Class
             </div>
          )}
          
          {/* Visual approximation / Mnemonic styling */}
          <div className="flex-1 flex flex-col items-center justify-center w-full relative">
            <span className={`text-8xl font-bold ${colors.text} opacity-20 absolute select-none pointer-events-none`}>
              {displayLetter}
            </span>
            <div className="z-10 text-center flex flex-col items-center justify-center h-full pt-4">
              {hintText || item.mnemonicEmoji ? (
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-28 h-28 rounded-full bg-white bg-opacity-60 border-2 border-dashed ${colors.border} flex items-center justify-center relative shadow-inner`}>
                    {item.mnemonicEmoji ? (
                      <span className="text-6xl absolute z-0 opacity-40 mix-blend-multiply filter drop-shadow-sm">{item.mnemonicEmoji}</span>
                    ) : null}
                    <span className={`text-7xl font-medium ${colors.text} z-10 drop-shadow-md`}>{displayLetter}</span>
                  </div>
                  <p className={`text-[15px] font-semibold mt-1 ${colors.text} px-2 leading-tight text-center max-w-[90%] font-sans`}>{hintText}</p>
                </div>
              ) : (
                 <span className={`text-8xl ${colors.text}`}>{displayLetter}</span>
              )}
            </div>
          </div>
          
          <div className="absolute bottom-4 text-slate-400 text-xs font-sans">
             {language === 'en' ? 'Tap to flip' : 'Appuyez pour retourner'}
          </div>
        </div>

        {/* Back of the card: Abstract Letter Side */}
        <div 
          className="absolute inset-0 w-full h-full bg-white rounded-3xl border-2 border-slate-100 shadow-sm flex flex-col items-center justify-center relative"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className="text-8xl font-medium text-slate-800">{displayLetter}</span>
          
          {onPlayAudio && (
            <div 
              className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors p-2"
              onClick={(e) => {
                e.stopPropagation();
                onPlayAudio();
              }}
            >
              <Volume2 size={24} />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

