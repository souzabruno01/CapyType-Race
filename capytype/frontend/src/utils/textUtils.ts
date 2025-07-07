
// capytype/frontend/src/utils/textUtils.ts

/**
 * A collection of default texts for the race, used as a fallback or for initial state.
 */
export const defaultTexts = [
  "The quick brown fox jumps over the lazy dog.",
  "Capybaras are the friendliest animals in the world.",
  "Never underestimate the power of a good nap.",
  "The early bird gets the worm, but the second mouse gets the cheese.",
  "Programming is 10% writing code and 90% understanding why it's not working.",
];

/**
 * Selects a random text from the default list.
 * @returns {string} A random default text.
 */
export function getRandomDefaultText(): string {
  const randomIndex = Math.floor(Math.random() * defaultTexts.length);
  return defaultTexts[randomIndex];
}
