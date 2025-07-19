// capytype/backend/src/textGeneration.ts
import { faker } from '@faker-js/faker';

// Define types for better type safety
type Difficulty = 'easy' | 'medium' | 'hard';
type Category = 'quotes' | 'code' | 'facts' | 'stories' | 'technical' | 'literature';

type TextLibrary = {
  [key in Category]: {
    [key in Difficulty]: string[];
  };
};

// Enhanced library with more diverse content
const staticTexts: TextLibrary = {
  quotes: {
    easy: [
      "The only way to do great work is to love what you do.",
      "Life is what happens when you're busy making other plans.",
      "The future belongs to those who believe in the beauty of their dreams.",
      "It does not matter how slowly you go as long as you do not stop.",
      "Everything you can imagine is real.",
    ],
    medium: [
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      "In three words I can sum up everything I've learned about life: it goes on.",
      "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
      "The only thing we have to fear is fear itself.",
      "Yesterday is history, tomorrow is a mystery, today is a gift of God, which is why we call it the present.",
    ],
    hard: [
      "The unexamined life is not worth living. - Socrates",
      "He who has a why to live for can bear almost any how. - Friedrich Nietzsche",
      "What you get by achieving your goals is not as important as what you become by achieving your goals. - Zig Ziglar",
      "I have not failed. I've just found 10,000 ways that won't work. - Thomas A. Edison",
      "The greatest glory in living lies not in never falling, but in rising every time we fall. - Nelson Mandela",
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
      "type UserProfile = { id: string; displayName: string; email?: string; createdAt: Date; preferences: { theme: 'dark' | 'light'; notifications: boolean; } };",
      "interface ApiResponse<T> { data: T; status: number; message: string; timestamp: Date; }"
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
  },
  stories: {
    easy: [
      "Once upon a time, there was a little capybara who loved to swim. Every morning, she would wake up early and jump into the cool river water.",
      "The sun was shining brightly as Maria walked through the park. She could hear birds singing and children playing in the distance.",
      "Tom opened his laptop and began to code. He had a simple task today: create a function that would greet users by name.",
      "It was a quiet morning in the small village. The baker was already busy preparing fresh bread for the day ahead.",
    ],
    medium: [
      "The old library stood at the corner of Main Street, its weathered brick facade telling stories of countless readers who had passed through its doors. Inside, dust motes danced in the afternoon sunlight that streamed through tall windows.",
      "As the train pulled into the station, Sarah gathered her belongings and prepared to step into a new chapter of her life. The city sprawled before her, full of possibilities and challenges she had yet to imagine.",
      "The research team had been working for months on the mysterious artifact. Its smooth surface seemed to shift and change depending on the angle of observation, defying conventional scientific explanation.",
    ],
    hard: [
      "The quantum physicist stared at the equations covering the whiteboard, each symbol representing years of theoretical work. The implications of the breakthrough were staggering: if their calculations were correct, they had discovered a fundamental property of space-time that could revolutionize our understanding of the universe.",
      "In the depths of the Amazon rainforest, Dr. Rodriguez documented her observations of a previously unknown species of tree frog. The creature's unique adaptation to its environment challenged existing theories about amphibian evolution and suggested new possibilities for biodiversity research.",
    ],
  },
  technical: {
    easy: [
      "A database is a structured collection of data that is stored and organized in a way that allows for efficient retrieval and manipulation.",
      "An API, or Application Programming Interface, is a set of protocols and tools that allows different software applications to communicate with each other.",
      "Version control systems like Git help developers track changes to their code over time and collaborate with other team members.",
    ],
    medium: [
      "Machine learning algorithms can be broadly categorized into supervised learning, unsupervised learning, and reinforcement learning, each with distinct applications and methodologies.",
      "The microservices architecture pattern involves breaking down a large application into smaller, independently deployable services that communicate through well-defined APIs.",
      "Container orchestration platforms like Kubernetes provide automated deployment, scaling, and management of containerized applications across clusters of machines.",
    ],
    hard: [
      "Byzantine fault tolerance is a critical property in distributed systems that ensures the network can reach consensus even when some nodes behave maliciously or fail in arbitrary ways, which is particularly important in blockchain consensus mechanisms.",
      "The CAP theorem states that in a distributed data store, it is impossible to simultaneously guarantee more than two of the following three properties: consistency, availability, and partition tolerance, forcing architects to make strategic trade-offs.",
      "Quantum computing leverages quantum mechanical phenomena such as superposition and entanglement to perform calculations that would be intractable for classical computers, potentially revolutionizing fields like cryptography and optimization.",
    ],
  },
  literature: {
    easy: [
      "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness.",
      "To be or not to be, that is the question: Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune.",
      "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, I thought I would sail about a little.",
    ],
    medium: [
      "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood.",
      "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat.",
      "All children, except one, grow up. They soon know that they will grow up, and the way Wendy knew was this. One day when she was two years old she was playing in a garden.",
    ],
    hard: [
      "Stately, plump Buck Mulligan came from the stairhead, bearing a bowl of lather on which a mirror and a razor lay crossed. A yellow dressinggown, ungirdled, was sustained gently behind him on the mild morning air.",
      "riverrun, past Eve and Adam's, from swerve of shore to bend of bay, brings us by a commodius vicus of recirculation back to Howth Castle and Environs. Sir Tristram, violer d'amores, fr'over the short sea, had passencore rearrived.",
      "When Gregor Samsa woke up one morning from unsettling dreams, he found himself changed in his bed into a monstrous vermin. He was lying on his back as hard as armor plate, and when he lifted his head a little, he saw his vaulted brown belly.",
    ],
  },
};

/**
 * Generates dynamic text using faker.js based on category and difficulty
 */
function generateDynamicText(category: Category, difficulty: Difficulty): string {
  faker.seed(Date.now() + Math.floor(Math.random() * 1000)); // Ensure randomness

  switch (category) {
    case 'stories':
      return generateStory(difficulty);
    case 'technical':
      return generateTechnicalText(difficulty);
    case 'code':
      return generateCodeSnippet(difficulty);
    case 'literature':
      return generateLiteraryText(difficulty);
    case 'facts':
      return generateFactualText(difficulty);
    case 'quotes':
    default:
      return generateQuote(difficulty);
  }
}

function generateStory(difficulty: Difficulty): string {
  const characters = [
    faker.person.firstName(), 
    faker.person.firstName(), 
    faker.person.firstName()
  ];
  const locations = [
    faker.location.city(),
    faker.location.country(),
    `the ${faker.word.adjective()} ${faker.word.noun()}`
  ];
  const actions = [
    'discovered', 'explored', 'investigated', 'encountered', 'created', 'solved'
  ];

  switch (difficulty) {
    case 'easy':
      return `${characters[0]} lived in ${locations[0]}. One day, they ${faker.helpers.arrayElement(actions)} a ${faker.word.adjective()} ${faker.word.noun()}. It was ${faker.word.adjective()} and made them feel ${faker.word.adjective()}.`;
    
    case 'medium':
      return `In the bustling city of ${locations[0]}, ${characters[0]} worked as a ${faker.person.jobTitle()}. They had always been fascinated by ${faker.word.noun()}s, so when they ${faker.helpers.arrayElement(actions)} an unusual ${faker.word.adjective()} ${faker.word.noun()} in their ${faker.word.noun()}, they knew their life was about to change dramatically.`;
    
    case 'hard':
      return `The ${faker.word.adjective()} ${faker.person.jobTitle()} ${characters[0]} had spent years researching ${faker.word.noun()}s in ${locations[1]}. Their groundbreaking discovery of a ${faker.word.adjective()} ${faker.word.noun()} challenged conventional wisdom and sparked heated debates among colleagues. As ${characters[1]} and ${characters[2]} joined the investigation, they uncovered evidence that would reshape their understanding of ${faker.science.chemicalElement().name} interactions in ${faker.word.adjective()} environments.`;
  }
}

function generateTechnicalText(difficulty: Difficulty): string {
  const technologies = ['React', 'Node.js', 'Python', 'PostgreSQL', 'Docker', 'Kubernetes', 'TypeScript', 'GraphQL'];
  const concepts = ['scalability', 'performance', 'security', 'maintainability', 'reliability', 'efficiency'];

  switch (difficulty) {
    case 'easy':
      return `${faker.helpers.arrayElement(technologies)} is a popular technology used for ${faker.word.verb()}ing applications. It provides good ${faker.helpers.arrayElement(concepts)} and is easy to learn.`;
    
    case 'medium':
      return `When implementing ${faker.helpers.arrayElement(technologies)} in production environments, developers must consider ${faker.helpers.arrayElement(concepts)} implications. The architecture should support ${faker.number.int({ min: 1000, max: 10000 })} concurrent users while maintaining response times under ${faker.number.int({ min: 100, max: 500 })}ms.`;
    
    case 'hard':
      return `The distributed system architecture leverages ${faker.helpers.arrayElement(technologies)} microservices with event-driven communication patterns. By implementing Circuit Breaker patterns and exponential backoff strategies, the system achieves ${faker.number.float({ min: 99.9, max: 99.99, fractionDigits: 2 })}% uptime while processing ${faker.number.int({ min: 10000, max: 100000 })} requests per second across ${faker.number.int({ min: 5, max: 50 })} geographical regions.`;
  }
}

function generateCodeSnippet(difficulty: Difficulty): string {
  const variableNames = ['data', 'result', 'user', 'config', 'response', 'items'];
  const functionNames = ['process', 'handle', 'validate', 'transform', 'calculate', 'generate'];

  switch (difficulty) {
    case 'easy':
      const varName = faker.helpers.arrayElement(variableNames);
      const funcName = faker.helpers.arrayElement(functionNames);
      return `const ${varName} = ${faker.number.int({ min: 1, max: 100 })};\nfunction ${funcName}() {\n  return ${varName} * 2;\n}`;
    
    case 'medium':
      const asyncFunc = faker.helpers.arrayElement(functionNames);
      const endpoint = faker.internet.url();
      return `const ${asyncFunc}Data = async (id: string) => {\n  const response = await fetch(\`${endpoint}/api/users/\${id}\`);\n  if (!response.ok) throw new Error('Failed to fetch');\n  return response.json();\n};`;
    
    case 'hard':
      return `interface ${faker.hacker.noun().charAt(0).toUpperCase() + faker.hacker.noun().slice(1)}<T> {\n  id: string;\n  data: T;\n  metadata: Record<string, unknown>;\n  created: Date;\n}\n\nclass ${faker.hacker.noun().charAt(0).toUpperCase() + faker.hacker.noun().slice(1)}Service<T> {\n  private cache = new Map<string, T>();\n  \n  async process(input: T): Promise<${faker.hacker.noun().charAt(0).toUpperCase() + faker.hacker.noun().slice(1)}<T>> {\n    const id = crypto.randomUUID();\n    this.cache.set(id, input);\n    return { id, data: input, metadata: {}, created: new Date() };\n  }\n}`;
  }
}

function generateLiteraryText(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy':
      return `${faker.person.firstName()} walked through the ${faker.word.adjective()} garden, admiring the ${faker.color.human()} flowers that bloomed in the ${faker.date.month()} sunshine.`;
    
    case 'medium':
      return `The ${faker.word.adjective()} manuscript, discovered in the archives of ${faker.company.name()}, revealed secrets about ${faker.person.fullName()}'s life that historians had only theorized about. Each page, written in ${faker.word.adjective()} handwriting, told a story of ${faker.word.noun()} and ${faker.word.noun()} that shaped an entire generation.`;
    
    case 'hard':
      return `In the labyrinthine corridors of memory, where consciousness meets the ineffable boundaries of dream, ${faker.person.fullName()} wandered through landscapes both familiar and alien. The ${faker.word.adjective()} quality of light that filtered through ${faker.word.adjective()} windows seemed to bend reality itself, creating shadows that whispered of ${faker.word.noun()}s long forgotten and futures yet unborn.`;
  }
}

function generateFactualText(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy':
      return `The ${faker.animal.type()} is known for its ${faker.word.adjective()} behavior. They typically live in ${faker.location.country()} and can grow up to ${faker.number.int({ min: 10, max: 200 })} centimeters long.`;
    
    case 'medium':
      return `Scientists at ${faker.company.name()} University have discovered that ${faker.animal.type()}s exhibit ${faker.word.adjective()} patterns during ${faker.date.month()}. This research, published in the Journal of ${faker.science.chemicalElement().name} Studies, suggests that environmental factors play a crucial role in their ${faker.word.noun()} cycles.`;
    
    case 'hard':
      return `The phenomenon of ${faker.word.adjective()} ${faker.word.noun()} interactions in ${faker.science.chemicalElement().name}-based compounds demonstrates remarkable ${faker.word.adjective()} properties under specific atmospheric conditions. Recent studies utilizing advanced spectroscopy techniques have revealed that molecular vibrations at ${faker.number.int({ min: 1000, max: 5000 })} Hz correlate with ${faker.word.adjective()} behavioral changes in laboratory specimens, challenging previously accepted theories about ${faker.word.noun()} dynamics.`;
  }
}

function generateQuote(difficulty: Difficulty): string {
  const authors = [faker.person.fullName(), faker.person.fullName(), faker.person.fullName()];
  
  switch (difficulty) {
    case 'easy':
      return `"${faker.word.adjective().charAt(0).toUpperCase() + faker.word.adjective().slice(1)} people ${faker.word.verb()} ${faker.word.adjective()} things." - ${faker.helpers.arrayElement(authors)}`;
    
    case 'medium':
      return `"The ${faker.word.adjective()} path to ${faker.word.noun()} is not through ${faker.word.verb()}ing, but through ${faker.word.verb()}ing with ${faker.word.noun()} and ${faker.word.noun()}." - ${faker.helpers.arrayElement(authors)}`;
    
    case 'hard':
      return `"In the vast expanse of human ${faker.word.noun()}, we find that ${faker.word.adjective()} ${faker.word.noun()}s often ${faker.word.verb()} the most ${faker.word.adjective()} aspects of our ${faker.word.noun()}, revealing truths about ${faker.word.noun()} that transcend the boundaries of conventional ${faker.word.noun()}." - ${faker.helpers.arrayElement(authors)}`;
  }
}

/**
 * Calculate optimal race duration based on text characteristics
 */
export function calculateRaceDuration(text: string): number {
  const textLength = text.length;
  const wordCount = text.split(/\s+/).length;
  const avgWordsPerMinute = 40; // Conservative estimate for typing
  
  // Base calculation: time needed for average typist
  const baseTimeMinutes = wordCount / avgWordsPerMinute;
  
  // Add complexity factors
  let complexityMultiplier = 1;
  
  // Punctuation complexity
  const punctuationCount = (text.match(/[.,;:!?"'()[\]{}-]/g) || []).length;
  complexityMultiplier += (punctuationCount / textLength) * 0.5;
  
  // Number complexity
  const numberCount = (text.match(/\d/g) || []).length;
  complexityMultiplier += (numberCount / textLength) * 0.3;
  
  // Special character complexity
  const specialCharCount = (text.match(/[<>{}@#$%^&*+=|\\]/g) || []).length;
  complexityMultiplier += (specialCharCount / textLength) * 0.8;
  
  // Convert to seconds and apply complexity
  const baseTimeSeconds = baseTimeMinutes * 60 * complexityMultiplier;
  
  // Ensure minimum time (1 second per character)
  const minimumTime = textLength * 1;
  
  // Add network and UI buffer
  const networkBuffer = Math.max(5, textLength * 0.1);
  
  return Math.max(minimumTime, baseTimeSeconds) + networkBuffer;
}

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
 * Gets text based on preferences, with fallback to random generation
 */
export function getRandomText(category?: Category, difficulty?: Difficulty): string {
  // Set defaults if not provided
  const finalCategory = category || faker.helpers.arrayElement(['quotes', 'code', 'facts', 'stories', 'technical', 'literature']);
  const finalDifficulty = difficulty || faker.helpers.arrayElement(['easy', 'medium', 'hard']);

  // 70% chance to use static content, 30% chance for dynamic generation
  const useStatic = Math.random() < 0.7;
  
  if (useStatic && staticTexts[finalCategory] && staticTexts[finalCategory][finalDifficulty]) {
    const textsArray = staticTexts[finalCategory][finalDifficulty];
    if (textsArray.length > 0) {
      const randomIndex = Math.floor(Math.random() * textsArray.length);
      return textsArray[randomIndex];
    }
  }
  
  // Fallback to dynamic generation
  return generateDynamicText(finalCategory, finalDifficulty);
}

/**
 * Enhanced text generation with smart defaults and variety
 */
export function generateText(options: { category?: Category; difficulty?: Difficulty; minLength?: number; maxLength?: number } = {}): string {
  const { category, difficulty, minLength = 50, maxLength = 400 } = options;
  
  let text = getRandomText(category, difficulty);
  
  // Ensure text meets length requirements
  if (text.length < minLength) {
    // Add more content if too short
    const additionalText = getRandomText(category, difficulty);
    text = `${text} ${additionalText}`;
  }
  
  if (text.length > maxLength) {
    // Trim if too long, but preserve word boundaries
    text = text.substring(0, maxLength);
    const lastSpace = text.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
      text = text.substring(0, lastSpace);
    }
    text += '...';
  }
  
  return text.trim();
}
