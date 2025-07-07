// Text generation utility with difficulty levels
export interface TextOptions {
  difficulty: 'easy' | 'medium' | 'hard';
  category?: 'general' | 'programming' | 'quotes';
}

// Easy difficulty texts - short sentences, common words, minimal punctuation
const EASY_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "She sells seashells by the seashore.",
  "A bird in the hand is worth two in the bush.",
  "Time flies when you are having fun.",
  "The early bird catches the worm.",
  "Practice makes perfect every single day.",
  "Every cloud has a silver lining ahead.",
  "Good things come to those who wait.",
  "Rome was not built in a single day.",
  "The pen is mightier than the sword.",
  "Actions speak louder than words always.",
  "Better late than never in most cases.",
  "All that glitters is not gold today.",
  "When life gives you lemons make lemonade.",
  "The grass is always greener on the other side.",
];

// Medium difficulty texts - longer sentences, more complex vocabulary, standard punctuation
const MEDIUM_TEXTS = [
  "Technology has revolutionized the way we communicate, work, and live our daily lives in the modern world.",
  "Climate change represents one of the most significant challenges facing humanity in the twenty-first century.",
  "Artificial intelligence, machine learning, and automation are transforming industries at an unprecedented pace.",
  "The importance of education cannot be overstated; it serves as the foundation for personal and societal growth.",
  "Sustainable development requires balancing economic growth, environmental protection, and social equity effectively.",
  "Innovation drives progress, but it also requires creativity, persistence, and the willingness to embrace failure.",
  "Globalization has connected the world in ways previously unimaginable, creating both opportunities and challenges.",
  "The human brain's capacity for learning, adaptation, and problem-solving continues to amaze scientists worldwide.",
  "Digital transformation is not just about technology; it's about reimagining how organizations operate and deliver value.",
  "Collaboration between diverse teams often produces the most innovative solutions to complex problems.",
  "The intersection of science, technology, and ethics will define the future of human civilization.",
  "Renewable energy sources like solar, wind, and hydroelectric power are becoming increasingly cost-effective.",
  "Cybersecurity has become a critical concern as our dependence on digital infrastructure continues to grow.",
  "The democratization of information through the internet has empowered individuals and transformed societies.",
  "Emotional intelligence, critical thinking, and adaptability are essential skills for navigating the modern workplace.",
];

// Hard difficulty texts - complex/technical words, varied punctuation, special characters, numbers
const HARD_TEXTS = [
  "The algorithm's time complexity—O(n log n)—demonstrates its efficiency; however, space complexity remains O(n).",
  "Quantum entanglement exhibits \"spooky action at a distance\" (Einstein's words), challenging our understanding of physics.",
  "The database query: SELECT * FROM users WHERE age >= 21 AND status != 'inactive'; returned 1,247 results.",
  "Mitochondria—often called the \"powerhouses\" of cells—generate ATP through oxidative phosphorylation processes.",
  "The regex pattern /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/ validates email addresses effectively.",
  "Neuroplasticity research suggests that synaptic connections can be modified through experience & repetition (20-30% improvement).",
  "The cryptocurrency's market cap exceeded $2.5 trillion; Bitcoin alone represented ~40% of the total valuation.",
  "Polymorphism in object-oriented programming allows objects of different types to be treated uniformly through inheritance.",
  "CRISPR-Cas9 technology enables precise genome editing by cutting DNA at specific locations—revolutionizing biotechnology.",
  "The TCP/IP protocol suite consists of four layers: Application (HTTP/HTTPS), Transport (TCP/UDP), Internet (IP), and Link.",
  "Photosynthesis converts CO₂ + H₂O + sunlight → C₆H₁₂O₆ + O₂, producing glucose & oxygen (6:6:1:6 ratio).",
  "Machine learning models require hyperparameter tuning; common techniques include grid search, random search & Bayesian optimization.",
  "The thermodynamic equation ΔG = ΔH - TΔS determines whether a reaction is spontaneous (ΔG < 0) or non-spontaneous.",
  "Microservices architecture promotes loose coupling between services; API gateways manage routing, authentication & rate limiting.",
  "The Heisenberg uncertainty principle states: Δx × Δp ≥ ℏ/2, where ℏ is the reduced Planck constant.",
];

// Programming-specific texts for each difficulty
const PROGRAMMING_EASY = [
  "Variables store data in computer programs.",
  "Functions help organize and reuse code blocks.",
  "Loops repeat actions multiple times efficiently.",
  "Arrays hold multiple values in one place.",
  "If statements make decisions in programs.",
  "Comments explain what the code does clearly.",
  "Debugging finds and fixes errors in code.",
  "Testing ensures programs work as expected.",
  "Classes define objects and their behavior.",
  "Methods are functions inside a class.",
];

const PROGRAMMING_MEDIUM = [
  "Object-oriented programming emphasizes encapsulation, inheritance, and polymorphism as core principles.",
  "Version control systems like Git help developers track changes and collaborate on projects effectively.",
  "RESTful APIs provide a standardized way for applications to communicate over HTTP protocols.",
  "Database normalization reduces redundancy and improves data integrity in relational systems.",
  "Agile methodology promotes iterative development, continuous feedback, and adaptive planning processes.",
  "Unit testing ensures individual components function correctly before integration with larger systems.",
  "Design patterns like Singleton, Factory, and Observer solve common programming problems elegantly.",
  "Continuous integration automates testing and deployment, reducing manual errors and improving quality.",
  "Data structures like trees, graphs, and hash tables optimize storage and retrieval operations.",
  "Exception handling manages runtime errors gracefully, preventing application crashes and data loss.",
];

const PROGRAMMING_HARD = [
  "The factory pattern instantiates objects without specifying exact classes: AbstractFactory.createProduct();",
  "Asynchronous programming with async/await syntax: const data = await fetch('/api/users').then(res => res.json());",
  "Generic constraints in TypeScript: function process<T extends Serializable>(item: T): Promise<T[]> { }",
  "Lambda expressions in Java 8+: List<String> filtered = list.stream().filter(s -> s.length() > 5).collect(toList());",
  "React hooks with dependencies: useEffect(() => { /* side effect */ }, [dependency1, dependency2]);",
  "SQL window functions: SELECT name, salary, RANK() OVER (PARTITION BY dept ORDER BY salary DESC) FROM employees;",
  "Docker multi-stage builds: FROM node:16 AS builder \\n RUN npm install \\n FROM nginx:alpine \\n COPY --from=builder",
  "Kubernetes deployment YAML: apiVersion: apps/v1 \\n kind: Deployment \\n metadata: { name: app, labels: { app: web } }",
  "GraphQL resolver with TypeScript: async getUser(@Args('id') id: string): Promise<User | null> { return this.userService.findById(id); }",
  "Redis caching pattern: const cached = await redis.get(`user:${id}`); if (!cached) { /* fetch & cache */ }",
];

// Quote texts for different difficulties
const QUOTES_EASY = [
  "Be yourself everyone else is already taken.",
  "Life is what happens when you are busy making other plans.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "It is during our darkest moments that we must focus to see the light.",
  "The only way to do great work is to love what you do.",
  "In the end we will remember not the words of our enemies but the silence of our friends.",
  "The only thing we have to fear is fear itself.",
  "Ask not what your country can do for you ask what you can do for your country.",
  "I have a dream that one day this nation will rise up and live out the true meaning of its creed.",
  "That which does not kill us makes us stronger.",
];

const QUOTES_MEDIUM = [
  "The greatest glory in living lies not in never falling, but in rising every time we fall. - Nelson Mandela",
  "Innovation distinguishes between a leader and a follower. - Steve Jobs",
  "The only impossible journey is the one you never begin. - Tony Robbins",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "If life were predictable it would cease to be life, and be without flavor. - Eleanor Roosevelt",
  "Life is really simple, but we insist on making it complicated. - Confucius",
  "The purpose of our lives is to be happy. - Dalai Lama",
  "Get busy living or get busy dying. - Stephen King",
];

const QUOTES_HARD = [
  "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe! - Albert Einstein",
  "It is not the critic who counts; not the man who points out how the strong man stumbles... - Theodore Roosevelt",
  "Yesterday is history, tomorrow is a mystery, today is a gift—that's why they call it 'the present.' - Eleanor Roosevelt",
  "I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel. - Maya Angelou",
  "The man who moves a mountain begins by carrying away small stones. - Confucius",
  "It does not matter how slowly you go as long as you do not stop. - Confucius",
  "Everything you've ever wanted is on the other side of fear. - George Addair",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "The only person you are destined to become is the person you decide to be. - Ralph Waldo Emerson",
  "What lies behind us and what lies before us are tiny matters compared to what lies within us. - Ralph Waldo Emerson",
];

export function getTextByDifficulty(options: TextOptions): string {
  const { difficulty, category = 'general' } = options;
  
  let textPool: string[] = [];
  
  if (category === 'programming') {
    switch (difficulty) {
      case 'easy':
        textPool = PROGRAMMING_EASY;
        break;
      case 'medium':
        textPool = PROGRAMMING_MEDIUM;
        break;
      case 'hard':
        textPool = PROGRAMMING_HARD;
        break;
    }
  } else if (category === 'quotes') {
    switch (difficulty) {
      case 'easy':
        textPool = QUOTES_EASY;
        break;
      case 'medium':
        textPool = QUOTES_MEDIUM;
        break;
      case 'hard':
        textPool = QUOTES_HARD;
        break;
    }
  } else {
    // General category
    switch (difficulty) {
      case 'easy':
        textPool = EASY_TEXTS;
        break;
      case 'medium':
        textPool = MEDIUM_TEXTS;
        break;
      case 'hard':
        textPool = HARD_TEXTS;
        break;
    }
  }
  
  // Return a random text from the selected pool
  const randomIndex = Math.floor(Math.random() * textPool.length);
  return textPool[randomIndex];
}

// Get a random text with default easy difficulty
export function getRandomText(): string {
  return getTextByDifficulty({ difficulty: 'easy', category: 'general' });
}
