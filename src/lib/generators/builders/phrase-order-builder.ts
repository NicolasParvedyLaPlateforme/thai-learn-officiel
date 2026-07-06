import { Exercise, Phrase, Word } from "@/types";

export function buildPhraseOrder(
  phrase: Phrase,
  language: string,
  options: { pool: Word[] }
): Exercise | null {
  if (!phrase.components || phrase.components.length < 2) return null;

  // Filter out any space components to only count real words
  const validComponents = phrase.components.map(cId => {
    return options.pool.find(w => w.id === cId);
  }).filter(Boolean) as Word[];

  if (validComponents.length < 2) return null;

  // 60% chance to disorder the sentence
  const isDisordered = Math.random() < 0.60;
  
  const correctOrder = validComponents.map(w => w.id);
  let presentedOrder = [...correctOrder];

  if (isDisordered) {
    // Swap 2 distinct items
    const idx1 = Math.floor(Math.random() * presentedOrder.length);
    let idx2 = Math.floor(Math.random() * presentedOrder.length);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * presentedOrder.length);
    }
    const temp = presentedOrder[idx1];
    presentedOrder[idx1] = presentedOrder[idx2];
    presentedOrder[idx2] = temp;
  }

  const isCorrectOrder = !isDisordered;

  return {
    id: `po-${phrase.id}-${Date.now()}-${Math.random()}`,
    type: 'phrase-order',
    question: phrase.fr || phrase.en || '',
    answer: "true", // Used initially for grading the true/false part, or just controlled by component
    options: validComponents, // Options holds the dictionary of words used in the phrase
    targetSound: phrase.th,
    presentedOrder,
    correctOrder,
    isCorrectOrder,
    maxMistakes: 2
  };
}
