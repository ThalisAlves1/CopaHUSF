import { Question } from './questions-type';
import { META1_QUESTIONS } from './questions/meta1';
import { META2_QUESTIONS } from './questions/meta2';
import { META3_QUESTIONS } from './questions/meta3';
import { META4_QUESTIONS } from './questions/meta4';
import { META5_QUESTIONS } from './questions/meta5';
import { META6_QUESTIONS } from './questions/meta6';

export type { Question };

export const QUESTIONS_DB: Record<number, Question[]> = {
  1: META1_QUESTIONS,
  2: META2_QUESTIONS,
  3: META3_QUESTIONS,
  4: META4_QUESTIONS,
  5: META5_QUESTIONS,
  6: META6_QUESTIONS
};

/**
 * Helper function to pick N random questions from the pool
 * and dynamically shuffle their options so the correct answer (originally option A)
 * is random at runtime while remaining functional.
 */
export const getRandomQuestions = (metaId: number, count: number = 5): Question[] => {
  const pool = QUESTIONS_DB[metaId];
  if (!pool) return [];
  
  // Clone and shuffle the question pool
  const shuffledQuestions = [...pool].sort(() => 0.5 - Math.random());
  
  // Take requested count and shuffle their options dynamically
  return shuffledQuestions.slice(0, count).map(q => {
    // Keep track of the original correct text (originally at index 0)
    const originalCorrectOption = q.options[q.correctIndex];
    
    // Shuffle the options array
    const shuffledOptions = [...q.options].sort(() => 0.5 - Math.random());
    
    // Find the new index of the correct answer
    const newCorrectIndex = shuffledOptions.indexOf(originalCorrectOption);
    
    return {
      ...q,
      options: shuffledOptions,
      correctIndex: newCorrectIndex
    };
  });
};
