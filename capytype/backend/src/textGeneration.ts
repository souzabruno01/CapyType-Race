// capytype/backend/src/textGeneration.ts

// Define types for better type safety
type Difficulty = 'easy' | 'medium' | 'hard';
type Category = 'quotes' | 'code' | 'facts';

type TextLibrary = {
  [key in Category]: {
    [key in Difficulty]: string[];
  };
};

// A simple library of texts categorized by theme and difficulty
const texts: TextLibrary = {
  quotes: {
    easy: [
      "The only way to do great work is to love what you do.",
      "Life is what happens when you're busy making other plans.",
      "The future belongs to those who believe in the beauty of their dreams.",
      "It does not matter how slowly you go as long as you do not stop.",
      "Everything you can imagine is real.",
    ],
    medium: [
      "The quick brown fox jumps over the lazy dog.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      "In three words I can sum up everything I've learned about life: it goes on.",
      "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
      "The only thing we have to fear is fear itself.",
    ],
    hard: [
      "The unexamined life is not worth living. - Socrates",
      "Discipline, not desire, determines your destiny.",
      "He who has a why to live for can bear almost any how. - Friedrich Nietzsche",
      "What you get by achieving your goals is not as important as what you become by achieving your goals. - Zig Ziglar",
      "I have not failed. I've just found 10,000 ways that won't work. - Thomas A. Edison",
    ],
  },
  code: {
    easy: [
      "const greet = (name) => `Hello, ${name}!`;",
      "for (let i = 0; i < 5; i++) { console.log(i); }",
      "function add(a, b) { return a + b; }",
      "const numbers = [1, 2, 3, 4, 5];",
      "const capy = { name: 'Capy', age: 2 };",
    ],
    medium: [
      "const fetchData = async () => { const response = await fetch(url); return response.json(); };",
      "const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);",
      "const { data, error, isLoading } = useQuery('todos', fetchTodos);",
      "const squaredNumbers = numbers.map(num => num * num).filter(sq => sq > 10);",
      "const sortedUsers = users.sort((a, b) => b.score - a.score);",
    ],
    hard: [
      "const binarySearch = (arr, target) => { let left = 0; let right = arr.length - 1; while (left <= right) { const mid = Math.floor((left + right) / 2); if (arr[mid] === target) return mid; if (arr[mid] < target) left = mid + 1; else right = mid - 1; } return -1; };",
      "const debounce = (func, delay) => { let timeoutId; return (...args) => { clearTimeout(timeoutId); timeoutId = setTimeout(() => func.apply(this, args), delay); }; };",
      "const compose = (...fns) => (x) => fns.reduceRight((y, f) => f(y), x);",
      "const promise = new Promise((resolve, reject) => { setTimeout(() => resolve('Success!'), 1000); });",
      "type UserProfile = { id: string; displayName: string; email?: string; };",
    ],
  },
  facts: {
    easy: [
        "A capybara is the world's largest rodent.",
        "Capybaras are excellent swimmers.",
        "They can stay underwater for several minutes.",
        "Capybaras are highly social animals.",
        "A group of capybaras is called a herd.",
    ],
    medium: [
        "The scientific name for the capybara is Hydrochoerus hydrochaeris.",
        "Capybaras are herbivores, feeding mainly on grasses and aquatic plants.",
        "Their teeth grow continuously throughout their lives.",
        "Predators of the capybara include jaguars, anacondas, and caimans.",
        "Capybaras can sleep in water, keeping their noses out to breathe.",
    ],
    hard: [
        "Capybaras possess a complex system of scent glands used for social communication and marking territory.",
        "The gestation period for a capybara is approximately 150 days, which is quite long for a rodent.",
        "Unlike many other rodents, capybaras are coprophagous, meaning they eat their own feces to extract maximum nutrients.",
        "The capybara's closest living relative is the rock cavy, not a guinea pig as is commonly thought.",
        "The name 'capybara' comes from the Tupi language of Brazil, meaning 'master of the grasses'.",
    ],
  }
};

/**
 * Fetches a random quote from the Quotable API.
 * @returns {Promise<string>} A promise that resolves to a string containing the quote and author.
 */
export async function fetchRandomQuote(): Promise<string> {
  try {
    const response = await fetch('https://api.quotable.io/random?minLength=100&maxLength=250');
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();
    return `${data.content} - ${data.author}`;
  } catch (error) {
    console.error("Failed to fetch random quote:", error);
    // Fallback to a predefined quote in case of API failure
    return "The best way to predict the future is to create it. - Peter Drucker";
  }
}

/**
 * Gets a random text from the local library based on category and difficulty.
 * @param {string} category - The category of text (e.g., 'quotes', 'code').
 * @param {string} difficulty - The difficulty level (e.g., 'easy', 'medium', 'hard').
 * @returns {string} A random text string.
 */
export function getRandomText(category: Category, difficulty: Difficulty): string {
  const categoryTexts = texts[category];
  if (!categoryTexts) {
    return "Invalid category selected. Please try again.";
  }
  
  const difficultyTexts = categoryTexts[difficulty];
  if (!difficultyTexts || difficultyTexts.length === 0) {
    return "Invalid difficulty or no texts available for this level. Please try again.";
  }
  
  const randomIndex = Math.floor(Math.random() * difficultyTexts.length);
  return difficultyTexts[randomIndex];
}
