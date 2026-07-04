"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { m as motion, AnimatePresence } from 'motion/react';
import { Exercise, Word, Phrase } from "@/types";
import { THAI_ALPHABET } from "@/data/alphabet-data";
import { getToneResult } from "@/data/tone-rules";
import { ToneClass } from "@/types/alphabet";
import { analyzeSyllableContext, getFinalConsonantSound, calculateImplicitTone } from "@/lib/thai-phonetics";
import { playThaiTTS } from "@/lib/tts";
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import { ChevronLeft, ChevronRight, Volume2, ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from "@/lib/utils";

interface CompositionProps {
  exercise: Exercise;
  language: string;
}

// --- Détection des caractères thaïlandais nécessitant un empilement ---
const isUpperVowel = (char: string) => /[\u0E31\u0E34-\u0E37\u0E47\u0E4D]/.test(char);
const isToneMark = (char: string) => /[\u0E48-\u0E4C]/.test(char);
const isSpecialModifier = (char: string) => /[\u0E48-\u0E4C\u0E31\u0E47]/.test(char);

export default function Composition({ exercise, language }: CompositionProps) {
  const isPhrase = !!(exercise.introItem as any)?.components;
  const thText = exercise.answer;

  const characters = useMemo(() => Array.from(thText), [thText]);

  const selectableIndices = useMemo(() => {
    return characters
      .map((char, index) => {
        const item = THAI_ALPHABET.find(a => a.letter === char);
        return item ? index : -1;
      })
      .filter(idx => idx !== -1);
  }, [characters]);

  const [activeIdx, setActiveIdx] = useState<number>(() => {
    return selectableIndices[0] !== undefined ? selectableIndices[0] : 0;
  });

  const activeChar = characters[activeIdx];

  const activeAlphabetItem = useMemo(() => {
    if (!activeChar) return null;
    return THAI_ALPHABET.find(a => a.letter === activeChar) || null;
  }, [activeChar]);

  useEffect(() => {
    if (activeAlphabetItem) {
      playThaiTTS(activeAlphabetItem.exampleWord);
    }
  }, [activeIdx, activeAlphabetItem]);

  const currentSelectableIndex = selectableIndices.indexOf(activeIdx);
  const hasPrev = currentSelectableIndex > 0;
  const hasNext = currentSelectableIndex < selectableIndices.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      setActiveIdx(selectableIndices[currentSelectableIndex - 1]);
    }
  };

  const prevConsonantItem = useMemo(() => {
    if (!isSpecialModifier(activeChar)) return null;
    for (let i = currentSelectableIndex - 1; i >= 0; i--) {
      const idx = selectableIndices[i];
      const char = characters[idx];
      const item = THAI_ALPHABET.find(a => a.letter === char);
      if (item && item.type === 'consonant') return item;
    }
    return null;
  }, [activeChar, characters, currentSelectableIndex, selectableIndices]);

  const prevConsonantIndex = useMemo(() => {
    if (!isSpecialModifier(activeChar)) return -1;
    for (let i = currentSelectableIndex - 1; i >= 0; i--) {
      const idx = selectableIndices[i];
      const char = characters[idx];
      const item = THAI_ALPHABET.find(a => a.letter === char);
      if (item && item.type === 'consonant') return idx;
    }
    return -1;
  }, [activeChar, characters, currentSelectableIndex, selectableIndices]);

  const syllableContext = useMemo(() => {
    return analyzeSyllableContext(characters, activeIdx, activeAlphabetItem);
  }, [characters, activeIdx, activeAlphabetItem]);

  const implicitToneResult = useMemo(() => {
    if (!syllableContext.initialConsonant) return null;
    const item = THAI_ALPHABET.find(a => a.letter === syllableContext.initialConsonant);
    if (!item || !item.consonantClass) return null;

    const baseClass = syllableContext.leadingConsonantClass || item.consonantClass;
    return calculateImplicitTone(baseClass as ToneClass, syllableContext.syllableType, syllableContext.hasShortVowel);
  }, [syllableContext]);

  const toneResult = useMemo(() => {
    if (!prevConsonantItem || !prevConsonantItem.consonantClass) return null;
    return getToneResult(prevConsonantItem.consonantClass as ToneClass, activeChar);
  }, [prevConsonantItem, activeChar]);

  const handleNext = () => {
    if (hasNext) {
      setActiveIdx(selectableIndices[currentSelectableIndex + 1]);
    }
  };

  const renderConsonantPronunciation = (pron: string) => {
    const match = pron.match(/^([a-z]+)(ɔ.*)$/i);
    if (match) {
      const prefix = match[1];
      const rest = match[2];
      return (
        <span className="font-sans">
          [<span className="text-emerald-500 font-extrabold uppercase">{prefix}</span>{rest}]
        </span>
      );
    }
    return <span className="font-sans">[{pron}]</span>;
  };

  const renderVowelPronunciation = (pron: string) => {
    const match = pron.match(/^(sara\s*)(.*)$/i);
    if (match) {
      const prefix = match[1];
      const rest = match[2];
      return (
        <span className="font-sans">
          [{prefix}<span className="text-2xl font-bold text-purple-800">{rest}</span>]
        </span>
      );
    }
    return <span className="font-sans">[{pron}]</span>;
  };

  const isConsonant = activeAlphabetItem?.type === 'consonant';
  const isVowel = activeAlphabetItem?.type === 'vowel';

  const titleText = isPhrase
    ? getTranslation('composition.title_phrase', language)?.replace('{phrase}', thText) || `Composition de la phrase (${thText})`
    : getTranslation('composition.title_word', language)?.replace('{word}', thText) || `Composition du mot (${thText})`;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-8 md:py-12 select-none">

      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-700 text-center mb-12 sm:mb-16">
        {titleText}
      </h2>

      <div className="w-full flex flex-col items-center gap-6 relative min-h-[320px] justify-center">

        {/* UPPER BUBBLE (Vowels & Others) */}
        <div className="h-28 flex items-end justify-center w-full">
          <AnimatePresence mode="wait">
            {isVowel && activeAlphabetItem && (
              <motion.div
                key={`vowel-${activeIdx}`}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-2 cursor-pointer group"
                onClick={() => playThaiTTS(activeAlphabetItem.exampleWord)}
              >
                <div className="bg-purple-50 hover:bg-purple-100/80 border-2 border-purple-200 text-purple-700 px-6 py-3.5 rounded-2xl shadow-sm flex items-center gap-3 transition-colors active:scale-95 duration-200">
                  <span className="text-xl font-bold font-thai">
                    {activeAlphabetItem.exampleWord}
                  </span>
                  <span className="text-lg font-bold font-sans text-purple-600/90 flex items-baseline">
                    {renderVowelPronunciation(activeAlphabetItem.pronunciation)}
                  </span>
                  <Volume2 size={18} className="text-purple-500 animate-pulse" />
                </div>

                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="text-purple-400"
                >
                  <ArrowUp size={20} className="stroke-[2.5]" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MIDDLE LAYER (Word/Phrase with Navigation) */}
        <div className="flex items-center justify-between w-full gap-4 sm:gap-8 py-2">

          <button
            onClick={handlePrev}
            disabled={!hasPrev}
            className={cn(
              "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all",
              hasPrev
                ? "bg-white hover:bg-slate-50 border-slate-200 text-slate-600 active:scale-90 hover:shadow-sm"
                : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
            )}
          >
            <ChevronLeft size={24} className="stroke-[2.5]" />
          </button>

          <div className="flex flex-wrap justify-center items-center gap-y-3 text-5xl sm:text-6xl md:text-7xl font-thai text-slate-800 tracking-wide select-none">
            {characters.map((char, index) => {
              const isSelected = index === activeIdx;
              const isSelectable = selectableIndices.includes(index);

              const isStackedMark = isToneMark(char) && index > 0 && isUpperVowel(characters[index - 1]);

              // NOUVEAU : On vérifie si ce caractère est la consonne modifiée par le ton actuel
              const isModifiedConsonant = index === prevConsonantIndex;
              // AJOUT : Vérifie si ce caractère est la consonne finale de la syllabe actuelle (qui crée le son mort/vivant)
              const isFinalConsonant = index === syllableContext.finalConsonantIndex && syllableContext.finalFamily !== "Mae Ko Ka";

              return (
                <span
                  key={index}
                  onClick={() => isSelectable && setActiveIdx(index)}
                  className={cn(
                    "relative cursor-pointer transition-all duration-300 select-none",
                    isStackedMark && "-top-[0.45em] z-10",
                    isSelected
                      ? isConsonant
                        ? "bg-emerald-50 text-emerald-600 font-bold scale-110 "
                        : "bg-purple-50 text-purple-600 font-bold scale-110 "
                      : isModifiedConsonant
                        ? "text-orange-500" // NOUVEAU : Texte orange, sans changement de taille
                        : isFinalConsonant
                          ? "text-teal-500 font-medium" // AJOUT : Texte turquoise pour la consonne finale
                          : isSelectable
                            ? "hover:bg-slate-100 text-slate-600"
                            : "text-slate-300 cursor-default"
                  )}
                >
                  {char}
                </span>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            disabled={!hasNext}
            className={cn(
              "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all",
              hasNext
                ? "bg-white hover:bg-slate-50 border-slate-200 text-slate-600 active:scale-90 hover:shadow-sm"
                : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
            )}
          >
            <ChevronRight size={24} className="stroke-[2.5]" />
          </button>

        </div>

        {/* LOWER BUBBLE (Consonants & Special Vowels Explanations) */}
        <div className="h-28 flex items-start justify-center w-full">
          <AnimatePresence mode="wait">

            {/* Cas 1 : Affichage des Consonnes */}
            {isConsonant && activeAlphabetItem && (
              <motion.div
                key={`consonant-${activeIdx}`}
                initial={{ opacity: 0, y: -15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-2 cursor-pointer group"
                onClick={() => playThaiTTS(activeAlphabetItem.exampleWord)}
              >
                <motion.div
                  animate={{ y: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="text-emerald-400"
                >
                  <ArrowDown size={20} className="stroke-[2.5]" />
                </motion.div>

                <div className="bg-emerald-50 hover:bg-emerald-100/80 border-2 border-emerald-200 text-emerald-700 px-6 py-3.5 rounded-2xl shadow-sm flex items-center gap-3 transition-colors active:scale-95 duration-200">
                  <span className="text-xl font-bold font-thai">
                    {activeAlphabetItem.exampleWord}
                  </span>
                  <span className="text-lg font-bold font-sans">
                    {renderConsonantPronunciation(activeAlphabetItem.pronunciation)}
                  </span>
                  <Volume2 size={18} className="text-emerald-500 animate-pulse" />
                </div>

                {/* Explication supplémentaire si c'est une consonne finale (Mata) */}
                {syllableContext.finalConsonantIndex === activeIdx && syllableContext.finalFamily !== "Mae Ko Ka" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    className="mt-1 bg-teal-50 border-2 border-teal-200 text-teal-800 px-6 py-3 rounded-2xl shadow-sm flex flex-col items-center text-center max-w-sm"
                  >
                    <span className="text-sm font-medium">
                      <strong>{getTranslation('composition.final_consonant', language)}</strong> : {' '}
                      {getTranslation(`composition.mata_explanation`, language)
                        ?.replace('{mata}', getTranslation(`composition.mata.${syllableContext.finalFamily}`, language) || syllableContext.finalFamily)
                        ?.replace('{sound}', getFinalConsonantSound(syllableContext.finalFamily))}
                    </span>
                  </motion.div>
                )}

                {/* NOUVEAU : Explication pour la voyelle implicite (A ou O court) */}
                {syllableContext.implicitVowelType && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.2 }}
                    className={`mt-1 border-2 px-6 py-3 rounded-2xl shadow-sm flex flex-col items-center text-center max-w-sm ${syllableContext.implicitVowelType === 'a' ? 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-800' : 'bg-purple-50 border-purple-200 text-purple-800'}`}
                  >
                    <span className="text-sm font-medium">
                      {syllableContext.implicitVowelType === 'a' 
                        ? getTranslation('composition.implicit_a_vowel', language)
                        : getTranslation('composition.implicit_o_vowel', language)
                      }
                    </span>
                  </motion.div>
                )}

                {/* NOUVEAU : Explication d'une transformation de voyelle (consonnes agissant comme voyelles, ex: ว, อ) */}
                {syllableContext.specialVowelRule && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.2 }}
                    className="mt-1 bg-indigo-50 border-2 border-indigo-200 text-indigo-800 px-6 py-3 rounded-2xl shadow-sm flex flex-col items-center text-center max-w-sm"
                  >
                    <span className="text-sm font-medium">
                      {getTranslation(`composition.vowel_rule.${syllableContext.specialVowelRule}`, language)}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* --- AJOUT : Cas 2 : Explication des voyelles spéciales / Marques de ton --- */}
            {(!isConsonant && activeAlphabetItem && isSpecialModifier(activeChar) || isVowel) && (
              <motion.div
                key={`explanation-${activeIdx}`}
                initial={{ opacity: 0, y: -15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-2"
              >
                {/* Flèche vers le bas de couleur bleue pour différencier de la consonne */}
                <motion.div
                  animate={{ y: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="text-blue-400"
                >
                  <ArrowDown size={20} className="stroke-[2.5]" />
                </motion.div>

                {/* Bulle d'explication pour les modificateurs spéciaux (seulement si ce n'est pas une simple voyelle longue normale sans impact ton spécifique demandé ici, bien que l'on puisse tout afficher) */}
                {isSpecialModifier(activeChar) && !syllableContext.specialVowelRule && (
                  <div className="bg-blue-50 border-2 border-blue-200 text-blue-800 px-6 py-3 rounded-2xl shadow-sm flex flex-col items-center text-center max-w-sm">
                    <span className="text-sm font-medium">
                      {getTranslation(`composition.special_modifier.${activeChar}`, language) || getTranslation('composition.tone_mark_explanation', language)}
                    </span>
                  </div>
                )}

                {/* NOUVEAU : Explication d'une transformation de voyelle (voyelles se transformant, ex: เ, ิ, ็) */}
                {syllableContext.specialVowelRule && (
                  <div className="bg-indigo-50 border-2 border-indigo-200 text-indigo-800 px-6 py-3 rounded-2xl shadow-sm flex flex-col items-center text-center max-w-sm">
                    <span className="text-sm font-medium">
                      {getTranslation(`composition.vowel_rule.${syllableContext.specialVowelRule}`, language)}
                    </span>
                  </div>
                )}

                {/* --- NOUVELLE BULLE : Règle de ton dynamique --- */}
                {isToneMark(activeChar) ? (
                  // Equation directe (Marque de ton)
                  prevConsonantItem && prevConsonantItem.consonantClass && toneResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.2 }}
                      className="mt-1 bg-amber-50 border-2 border-amber-200 text-amber-800 px-6 py-3 rounded-2xl shadow-sm flex flex-col items-center text-center max-w-sm"
                    >
                      <span className="text-sm font-medium">
                        {getTranslation('composition.tone_rule_prefix', language)}
                        <strong className="mx-1">{getTranslation(`composition.tone_class.${prevConsonantItem.consonantClass}`, language)}</strong>
                        + <strong className="font-thai text-lg">{activeChar}</strong> =
                        <strong className="ml-1 uppercase text-amber-600">{getTranslation(`composition.tone_result.${toneResult}`, language)}</strong>
                      </span>
                    </motion.div>
                  )
                ) : (
                  // Equation implicite (Syllabe morte/vivante pour les voyelles)
                  syllableContext.initialConsonant && implicitToneResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.2 }}
                      className="mt-1 bg-amber-50 border-2 border-amber-200 text-amber-800 px-6 py-3 rounded-2xl shadow-sm flex flex-col items-center text-center max-w-sm"
                    >
                      <span className="text-sm font-medium">
                        {getTranslation('composition.tone_rule_prefix', language)}
                        <strong className="mx-1v text-orange-500">
                          {getTranslation(`composition.tone_class.${syllableContext.leadingConsonantClass || THAI_ALPHABET.find(a => a.letter === syllableContext.initialConsonant)?.consonantClass}`, language)}
                        </strong>
                        + <strong className="mx-1 text-purple-600 ">{getTranslation(`composition.vowel_length.${syllableContext.hasShortVowel ? 'short' : 'long'}`, language)}</strong>
                        + <strong className="mx-1 text-teal-600">{getTranslation(`composition.syllable_type.${syllableContext.syllableType}`, language)}</strong> =
                        <strong className="ml-1 uppercase text-amber-600">{getTranslation(`composition.tone_result.${implicitToneResult}`, language)}</strong>
                      </span>
                    </motion.div>
                  )
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}