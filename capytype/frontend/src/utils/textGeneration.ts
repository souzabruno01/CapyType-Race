// Text generation utility with difficulty levels
export interface TextOptions {
  difficulty: 'easy' | 'medium' | 'hard';
  category?: 'general' | 'programming' | 'quotes' | 'science' | 'literature' | 'history' | 'business' | 'health' | 'sports' | 'food' | 'arts' | 'nature' | 'mathematics' | 'quickstart';
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

// Science texts for different difficulties
const SCIENCE_EASY = [
  "Water boils at 100 degrees Celsius at sea level.",
  "The Earth revolves around the Sun once every year.",
  "Plants need sunlight water and carbon dioxide to grow.",
  "The human body has 206 bones in total.",
  "Sound travels faster in water than in air.",
  "Gravity pulls objects toward the center of the Earth.",
  "The heart pumps blood throughout the body.",
  "DNA contains the genetic information of living things.",
  "The speed of light is about 300,000 kilometers per second.",
  "Oxygen is essential for human breathing and survival.",
];

const SCIENCE_MEDIUM = [
  "Photosynthesis is the process by which plants convert light energy into chemical energy using chlorophyll.",
  "The periodic table organizes chemical elements by their atomic number and similar properties.",
  "Newton's first law states that an object at rest stays at rest unless acted upon by force.",
  "The mitochondria are often called the powerhouses of the cell because they produce ATP.",
  "Evolution occurs through natural selection where favorable traits increase survival chances.",
  "The electromagnetic spectrum includes radio waves, microwaves, infrared, visible light, and X-rays.",
  "Chemical bonds form when atoms share or transfer electrons to achieve stable configurations.",
  "The nervous system coordinates body functions through electrical and chemical signals.",
  "Ecosystems maintain balance through complex interactions between producers, consumers, and decomposers.",
  "Plate tectonics explains how continents move and mountains form over geological time.",
];

const SCIENCE_HARD = [
  "Quantum mechanics describes the probabilistic nature of subatomic particles and wave-particle duality phenomena.",
  "CRISPR-Cas9 is a revolutionary gene-editing technology that allows precise modifications to DNA sequences.",
  "Thermodynamics dictates that entropy in an isolated system always increases over time, known as the second law.",
  "Protein folding is determined by amino acid sequences and environmental factors, affecting biological function.",
  "General relativity demonstrates how massive objects warp spacetime, causing gravitational effects we observe.",
  "Neurotransmitters like dopamine, serotonin, and acetylcholine regulate mood, cognition, and motor functions.",
  "The Standard Model of particle physics describes fundamental particles and three of the four known forces.",
  "Epigenetic modifications can alter gene expression without changing DNA sequences, affecting inheritance patterns.",
  "Climate systems involve complex feedback loops between atmosphere, hydrosphere, biosphere, and geosphere interactions.",
  "Molecular orbital theory explains chemical bonding through quantum mechanical principles and electron delocalization.",
];

// Literature texts for different difficulties  
const LITERATURE_EASY = [
  "To be or not to be that is the question.",
  "It was the best of times it was the worst of times.",
  "All that glitters is not gold.",
  "The pen is mightier than the sword.",
  "Pride comes before a fall.",
  "Actions speak louder than words.",
  "Beauty is in the eye of the beholder.",
  "Time heals all wounds slowly but surely.",
  "Where there is a will there is a way.",
  "Knowledge is power and power corrupts absolutely.",
];

const LITERATURE_MEDIUM = [
  "It is a truth universally acknowledged that a single man in possession of good fortune must be in want of a wife.",
  "Call me Ishmael. Some years ago, having little or no money in my purse, I thought I would sail about.",
  "In the beginning was the Word, and the Word was with God, and the Word was God.",
  "It was the age of wisdom, it was the age of foolishness, it was the epoch of belief.",
  "Happy families are all alike; every unhappy family is unhappy in its own way.",
  "The only way out of the labyrinth of suffering is to forgive according to Alaska Young.",
  "We are all in the gutter, but some of us are looking at the stars, said Oscar Wilde.",
  "The past is a foreign country: they do things differently there, wrote L.P. Hartley.",
  "If you want to know what a man's like, take a good look at how he treats his inferiors.",
  "Words have no power to impress the mind without the exquisite horror of their reality.",
];

const LITERATURE_HARD = [
  "Stately, plump Buck Mulligan came from the stairhead, bearing a bowl of lather on which a mirror and a razor lay crossed.",
  "It was a bright cold day in April, and the clocks were striking thirteen when Winston Smith slipped quickly through the glass doors.",
  "In those days cheap apartments were almost impossible to find in Manhattan, so I had to move to Brooklyn Heights.",
  "The snow began to fall as we talked, and I watched it through the restaurant window, settling on the sidewalk.",
  "Many years later, as he faced the firing squad, Colonel Aureliano Buendía was to remember that distant afternoon.",
  "Mother died today, or maybe yesterday; I can't be sure because the telegram was not clear about the date.",
  "When he was nearly forty years old, and in response to a famine that had devastated the country for three years running.",
  "Ships at a distance carry every man's wish on board, but the tide brings some wishes to shore while others sail away.",
  "It is a melancholy object to those who walk through this great town or travel in the country when they see the streets.",
  "The past is never dead. It's not even past, which explains why we continue to wrestle with historical consequences today.",
];

// History texts for different difficulties
const HISTORY_EASY = [
  "World War Two ended in 1945 with Allied victory.",
  "The American Civil War lasted from 1861 to 1865.",
  "The Berlin Wall fell in 1989 reuniting Germany.",
  "Christopher Columbus reached America in 1492.",
  "The French Revolution began in 1789 with uprising.",
  "Ancient Rome was founded according to legend in 753 BC.",
  "The Great Wall of China took centuries to build.",
  "The Renaissance began in Italy during the 14th century.",
  "Napoleon was defeated at Waterloo in 1815.",
  "The Industrial Revolution started in Britain around 1760.",
];

const HISTORY_MEDIUM = [
  "The Treaty of Versailles officially ended World War One and imposed harsh reparations on Germany.",
  "The Magna Carta signed in 1215 limited the power of English kings and established rule of law.",
  "The Black Death pandemic swept through Europe in the 14th century, killing millions of people.",
  "The Declaration of Independence was signed on July 4, 1776, establishing American independence from Britain.",
  "The Silk Road connected East and West, facilitating trade and cultural exchange for over 1,400 years.",
  "The Russian Revolution of 1917 led to the overthrow of the Tsarist regime and rise of communism.",
  "The Age of Exploration brought Europeans to the Americas, changing world history forever through colonization.",
  "The Enlightenment period emphasized reason, science, and individual rights over traditional authority and superstition.",
  "The Cold War divided the world into competing ideological blocs led by the United States and Soviet Union.",
  "The Scientific Revolution challenged medieval worldviews and established modern methods of inquiry and discovery.",
];

const HISTORY_HARD = [
  "The Peace of Westphalia in 1648 established the principle of national sovereignty and ended the devastating Thirty Years' War.",
  "The Congress of Vienna in 1815 redrew the European map after Napoleon's defeat, creating a balance of power system.",
  "The Meiji Restoration transformed Japan from a feudal society into a modern industrial nation within decades of implementation.",
  "The partition of India in 1947 created Pakistan and led to massive population displacement and communal violence.",
  "The Scramble for Africa resulted in European colonization of virtually the entire continent by the end of the 19th century.",
  "The Treaty of Brest-Litovsk allowed Germany to focus on the Western Front while Russia withdrew from World War One.",
  "The Hundred Years' War between England and France fundamentally altered medieval European politics and military technology.",
  "The Byzantine Empire preserved Roman and Greek knowledge for over a thousand years before falling to the Ottomans.",
  "The Mongol Empire under Genghis Khan and his successors created the largest contiguous land empire in human history.",
  "The Reformation sparked by Martin Luther divided Christianity and reshaped European politics, culture, and religious practice permanently.",
];

// Business texts for different difficulties
const BUSINESS_EASY = [
  "Supply and demand determine market prices for goods.",
  "Customer service is essential for business success.",
  "Profit equals revenue minus total business expenses.",
  "Marketing helps companies reach their target audience effectively.",
  "Good leadership motivates employees to work harder.",
  "Budgets help businesses plan and control their spending.",
  "Innovation drives competitive advantage in modern markets.",
  "Quality products build strong customer loyalty over time.",
  "Teamwork improves productivity and workplace satisfaction significantly.",
  "Strategic planning guides long-term business growth and success.",
];

const BUSINESS_MEDIUM = [
  "Return on investment measures the efficiency of an investment relative to its cost and potential gains.",
  "Cash flow management ensures businesses have enough liquidity to meet their operational obligations and expenses.",
  "Market segmentation divides consumers into distinct groups based on demographics, behavior, and preferences for targeting.",
  "Human resources departments handle recruitment, training, benefits, and employee relations within modern organizations effectively.",
  "Supply chain optimization reduces costs while improving delivery times and customer satisfaction across global networks.",
  "Brand equity represents the commercial value derived from consumer perception and recognition of a company's products.",
  "Financial statements including balance sheets and income statements provide insights into company performance and health.",
  "Competitive analysis helps businesses understand market positioning and identify opportunities for growth and improvement strategies.",
  "Corporate social responsibility initiatives demonstrate company commitment to ethical practices and community engagement beyond profits.",
  "Digital transformation integrates technology into all business areas, fundamentally changing operations and customer value delivery methods.",
];

const BUSINESS_HARD = [
  "Disruptive innovation creates new markets by introducing simpler, more affordable products that eventually displace established competitors.",
  "The efficient market hypothesis suggests that stock prices reflect all available information, making consistent outperformance nearly impossible.",
  "Blue ocean strategy involves creating uncontested market spaces rather than competing in existing markets with established players.",
  "Vertical integration allows companies to control multiple stages of production, potentially reducing costs but increasing complexity significantly.",
  "Behavioral economics demonstrates how psychological factors influence economic decisions, challenging traditional rational choice theory assumptions.",
  "Network effects occur when products become more valuable as more people use them, creating powerful competitive moats.",
  "Six Sigma methodology uses statistical analysis to identify and eliminate defects in manufacturing and business processes systematically.",
  "Agile methodology emphasizes iterative development, customer collaboration, and rapid response to change in project management approaches.",
  "Leveraged buyouts involve acquiring companies using significant debt, with the acquired company's assets serving as collateral for loans.",
  "Intellectual property protection through patents, trademarks, and copyrights creates sustainable competitive advantages in knowledge-based industries.",
];

// Health texts for different difficulties
const HEALTH_EASY = [
  "Regular exercise keeps your body strong and healthy.",
  "Eating vegetables and fruits provides essential vitamins daily.",
  "Getting eight hours of sleep helps your body recover.",
  "Drinking water throughout the day prevents dehydration completely.",
  "Washing hands frequently reduces the spread of germs.",
  "Dental hygiene prevents cavities and gum disease effectively.",
  "Sunscreen protects skin from harmful ultraviolet radiation damage.",
  "Deep breathing exercises help reduce stress and anxiety.",
  "Regular medical checkups detect health problems early on.",
  "Balanced meals provide energy and nutrients for daily activities.",
];

const HEALTH_MEDIUM = [
  "Cardiovascular exercise strengthens the heart muscle and improves circulation throughout the entire body system.",
  "Proper nutrition requires balancing proteins, carbohydrates, fats, vitamins, and minerals for optimal bodily function.",
  "Mental health is just as important as physical health and requires attention, care, and professional support.",
  "Vaccines help prevent serious diseases by training the immune system to recognize and fight specific pathogens.",
  "Chronic stress can lead to various health problems including high blood pressure, diabetes, and depression.",
  "Regular screenings for cancer, diabetes, and heart disease can save lives through early detection and treatment.",
  "Smoking cessation dramatically reduces the risk of lung cancer, heart disease, and numerous other health conditions.",
  "Meditation and mindfulness practices have been shown to reduce anxiety, improve focus, and enhance well-being.",
  "Maintaining a healthy weight through diet and exercise reduces the risk of many chronic diseases significantly.",
  "Social connections and relationships contribute significantly to mental health and overall life satisfaction and longevity.",
];

const HEALTH_HARD = [
  "Epigenetic modifications influenced by lifestyle factors can alter gene expression patterns affecting disease susceptibility across generations.",
  "The gut microbiome plays a crucial role in immune function, mental health, and metabolism through complex biochemical interactions.",
  "Neuroplasticity allows the brain to reorganize and form new neural connections throughout life, enabling recovery from injury.",
  "Autoimmune diseases occur when the immune system mistakenly attacks healthy cells, requiring immunosuppressive treatment strategies.",
  "Pharmacokinetics and pharmacodynamics determine how drugs are absorbed, distributed, metabolized, and eliminated from the human body.",
  "Precision medicine tailors treatment approaches based on individual genetic profiles, lifestyle factors, and environmental exposures for optimization.",
  "The endocrine system regulates hormones that control metabolism, growth, reproduction, and stress response through feedback mechanisms.",
  "Inflammatory pathways link chronic diseases including diabetes, cardiovascular disease, and cancer through common molecular mechanisms.",
  "Telemedicine and digital health technologies are revolutionizing healthcare delivery and patient monitoring in remote settings.",
  "Evidence-based medicine integrates clinical expertise with the best available research evidence and patient values for treatment decisions.",
];

// Sports texts for different difficulties
const SPORTS_EASY = [
  "Soccer is played with two teams of eleven players each.",
  "Basketball players score by shooting the ball through hoops.",
  "Tennis matches are played on grass clay or hard courts.",
  "Swimming builds strength and improves cardiovascular health significantly.",
  "Golf requires precision and patience to score well consistently.",
  "Running marathons tests endurance and mental strength equally.",
  "Baseball games consist of nine innings with three outs.",
  "Football teams advance the ball toward the end zone.",
  "Cycling provides excellent exercise and transportation benefits together.",
  "Hockey players use sticks to control and shoot pucks.",
];

const SPORTS_MEDIUM = [
  "The Olympics bring together athletes from around the world to compete in various sports every four years.",
  "Professional athletes must maintain strict training regimens and follow nutritional guidelines for peak performance.",
  "Team sports teach valuable lessons about cooperation, communication, and working toward common goals together.",
  "Individual sports like tennis and golf require mental toughness and the ability to perform under pressure.",
  "Sports medicine helps athletes prevent injuries and recover more quickly when injuries do occur unfortunately.",
  "The World Cup is the most prestigious soccer tournament, held every four years with global participation.",
  "Athletic scholarships provide opportunities for talented students to receive higher education while competing in sports.",
  "Youth sports programs promote physical fitness, social skills, and character development in children and teenagers.",
  "Sports psychology helps athletes improve mental performance, manage anxiety, and maintain focus during competition.",
  "Paralympic Games showcase the incredible abilities of athletes with disabilities, inspiring millions worldwide continuously.",
];

const SPORTS_HARD = [
  "Biomechanical analysis of athletic movement patterns helps optimize performance while reducing injury risk through scientific methodology.",
  "Sports analytics and performance metrics are revolutionizing how teams evaluate players and develop strategic game plans.",
  "The psychological phenomenon known as flow state occurs when athletes achieve optimal performance through complete focus and immersion.",
  "Periodization training involves systematically planning athletic development cycles to peak performance at specific competition times.",
  "Plyometric exercises improve explosive power and athletic performance by utilizing the stretch-shortening cycle of muscle contractions.",
  "Sports-related concussions have led to significant protocol changes and increased awareness of traumatic brain injury risks.",
  "The evolution of sports technology including equipment, surfaces, and monitoring devices continues to push performance boundaries.",
  "Gender equality in sports remains an ongoing challenge, with pay gaps and media coverage disparities persisting globally.",
  "Anti-doping agencies work continuously to maintain fair competition by detecting and deterring performance-enhancing drug use.",
  "The commercialization of professional sports has transformed athletics into a multi-billion dollar entertainment industry worldwide.",
];

// Food texts for different difficulties
const FOOD_EASY = [
  "Fresh fruits and vegetables provide essential vitamins and minerals.",
  "Cooking at home allows you to control ingredients and portions.",
  "Protein helps build and repair muscles in your body.",
  "Whole grains provide fiber and sustained energy throughout the day.",
  "Dairy products are good sources of calcium for bones.",
  "Spices and herbs add flavor without extra calories or sodium.",
  "Drinking plenty of water aids digestion and nutrient absorption.",
  "Meal planning saves time and helps maintain healthy eating habits.",
  "Reading food labels helps you make informed dietary choices.",
  "Moderation is key to maintaining a balanced and healthy diet.",
];

const FOOD_MEDIUM = [
  "The Mediterranean diet emphasizes olive oil, fish, fruits, vegetables, and whole grains for heart health.",
  "Fermented foods like yogurt, kimchi, and kombucha promote beneficial gut bacteria and digestive health.",
  "Sustainable agriculture practices help protect the environment while producing nutritious food for growing populations.",
  "Food safety protocols prevent contamination and foodborne illnesses through proper handling, storage, and preparation techniques.",
  "Culinary arts combine creativity, technique, and cultural traditions to create memorable dining experiences for people.",
  "Seasonal eating connects us with local agriculture and provides the freshest, most nutritious ingredients available.",
  "Plant-based diets can provide all necessary nutrients while reducing environmental impact and promoting animal welfare.",
  "Food allergies and intolerances require careful ingredient monitoring and alternative preparation methods for safe consumption.",
  "The farm-to-table movement supports local farmers and reduces the environmental impact of food transportation significantly.",
  "Molecular gastronomy applies scientific principles to cooking, creating innovative textures and presentations in modern cuisine.",
];

const FOOD_HARD = [
  "Nutritional genomics studies how genetic variations affect individual responses to nutrients and dietary interventions for personalized nutrition.",
  "The Maillard reaction between amino acids and sugars creates complex flavors and aromas in cooked foods through chemical processes.",
  "Food security involves ensuring reliable access to sufficient, safe, and nutritious food for all people globally.",
  "Umami, the fifth basic taste, is created by glutamates and enhances savory flavors in foods like cheese and mushrooms.",
  "Precision fermentation uses microorganisms to produce specific compounds for food ingredients without traditional agriculture methods.",
  "The glycemic index measures how quickly carbohydrates raise blood sugar levels, affecting energy and satiety patterns.",
  "Terroir encompasses environmental factors including soil, climate, and geography that influence agricultural product characteristics distinctively.",
  "Food technology innovations including lab-grown meat and alternative proteins address sustainability and ethical concerns effectively.",
  "Phytochemicals in plants provide health benefits beyond basic nutrition through antioxidant and anti-inflammatory properties naturally.",
  "The global food system involves complex supply chains connecting production, processing, distribution, and consumption across continents.",
];

// Arts texts for different difficulties
const ARTS_EASY = [
  "Painting uses colors and brushes to create beautiful images.",
  "Music combines rhythm melody and harmony to express emotions.",
  "Sculpture shapes materials like clay stone or metal creatively.",
  "Dance expresses stories and feelings through body movement.",
  "Photography captures moments and memories with cameras skillfully.",
  "Theater brings stories to life through acting and performance.",
  "Drawing requires only pencils and paper to create art.",
  "Singing uses the human voice as a musical instrument.",
  "Crafts create useful and decorative items by hand.",
  "Museums display art for everyone to enjoy and learn.",
];

const ARTS_MEDIUM = [
  "The Renaissance period produced masterpieces by Leonardo da Vinci, Michelangelo, and other influential artists throughout Europe.",
  "Abstract art moves away from realistic representation to focus on colors, shapes, and forms that express ideas.",
  "Classical music follows traditional structures and forms developed over centuries by composers like Bach and Mozart.",
  "Performance art combines various artistic mediums to create live experiences that engage audiences directly and emotionally.",
  "Digital art uses computer technology to create new forms of artistic expression in the modern technological age.",
  "Art therapy helps people express emotions and heal through creative activities guided by trained mental health professionals.",
  "Cultural traditions influence artistic styles and techniques passed down through generations within specific communities and regions.",
  "Art criticism analyzes and interprets artworks to help audiences understand deeper meanings and cultural significance.",
  "Public art installations transform urban spaces and make art accessible to diverse audiences in everyday settings.",
  "Mixed media artwork combines different materials and techniques to create unique textures and visual effects innovatively.",
];

const ARTS_HARD = [
  "Postmodern art challenges traditional boundaries and hierarchies, embracing pastiche, irony, and cultural critique as central themes.",
  "The avant-garde movements of the early 20th century revolutionized artistic expression through radical experimentation and rejection of conventions.",
  "Synesthesia in artistic creation involves the deliberate crossing of sensory modalities to produce multidimensional aesthetic experiences.",
  "Conceptual art prioritizes ideas and concepts over traditional aesthetic concerns, often using unconventional materials and presentation methods.",
  "The democratization of art through digital platforms has transformed how artists create, distribute, and monetize their creative works.",
  "Feminist art theory examines how gender influences artistic production, representation, and reception within patriarchal cultural systems.",
  "Neo-expressionism emerged in the 1980s as a reaction against minimalism, emphasizing emotional content and traditional painting techniques.",
  "Installation art creates immersive environments that transform spaces and engage viewers through multisensory experiences and interactions.",
  "The art market's financialization has turned artworks into investment commodities, affecting artistic production and cultural value systems.",
  "Deconstructivism in architecture challenges traditional notions of harmony and stability through fragmented and unconventional structural approaches.",
];

// Nature texts for different difficulties
const NATURE_EASY = [
  "Trees produce oxygen and help clean the air we breathe.",
  "Bees pollinate flowers helping plants reproduce and grow successfully.",
  "Rain provides water that plants and animals need to survive.",
  "The sun gives energy and warmth to all living things.",
  "Mountains form over millions of years through geological processes slowly.",
  "Oceans cover most of the Earth and contain countless species.",
  "Forests provide homes for many different animals and plants.",
  "Rivers flow from mountains to seas carrying water downstream.",
  "Seasons change as Earth orbits around the sun annually.",
  "Animals adapt to their environments to survive and thrive.",
];

const NATURE_MEDIUM = [
  "Ecosystems are complex networks of interactions between living organisms and their physical environment components.",
  "Biodiversity refers to the variety of life forms on Earth, including genetic, species, and ecosystem diversity.",
  "Photosynthesis allows plants to convert sunlight into energy while producing oxygen as a beneficial byproduct for animals.",
  "Food chains and food webs demonstrate how energy flows through ecosystems from producers to various consumer levels.",
  "Climate change affects weather patterns, sea levels, and species distributions across the globe significantly and permanently.",
  "Conservation efforts aim to protect endangered species and preserve natural habitats for future generations to enjoy.",
  "Natural selection drives evolution as organisms with advantageous traits are more likely to survive and reproduce successfully.",
  "Watersheds collect and channel rainwater, providing fresh water for human communities and natural ecosystems alike.",
  "Symbiotic relationships between species can be mutually beneficial, harmful, or neutral depending on the specific interaction.",
  "Geological processes like erosion, volcanism, and plate tectonics continuously reshape the Earth's surface over time.",
];

const NATURE_HARD = [
  "Keystone species have disproportionately large effects on ecosystem structure and function relative to their numerical abundance.",
  "Biogeochemical cycles including carbon, nitrogen, and phosphorus cycles regulate nutrient availability in natural systems globally.",
  "Phenotypic plasticity allows organisms to modify their characteristics in response to environmental conditions without genetic changes.",
  "Trophic cascades occur when changes in predator populations affect multiple levels of the food web through indirect effects.",
  "Metapopulations consist of spatially separated populations connected by migration, affecting long-term species persistence patterns.",
  "Ecological succession describes predictable changes in species composition following disturbances or in newly available habitats.",
  "Coevolution results from reciprocal evolutionary changes between interacting species over extended periods of geological time.",
  "Adaptive radiation occurs when species rapidly diversify to fill available ecological niches in new or changing environments.",
  "Ecosystem services including pollination, water purification, and climate regulation provide essential benefits to human societies.",
  "Fragmentation of natural habitats reduces biodiversity through edge effects, reduced population sizes, and disrupted ecological processes.",
];

// Mathematics texts for different difficulties
const MATHEMATICS_EASY = [
  "Addition and subtraction are basic arithmetic operations everyone should learn.",
  "Multiplication is repeated addition of the same number multiple times.",
  "Division splits numbers into equal groups or parts efficiently.",
  "Fractions represent parts of a whole number or quantity.",
  "Geometry studies shapes lines angles and their properties systematically.",
  "Even numbers can be divided by two with no remainder.",
  "Odd numbers leave a remainder of one when divided by two.",
  "Percentages express fractions as parts of one hundred total.",
  "Measuring length width and height helps describe object dimensions.",
  "Patterns in numbers help us predict what comes next.",
];

const MATHEMATICS_MEDIUM = [
  "Algebra uses variables and equations to solve problems involving unknown quantities and mathematical relationships.",
  "The Pythagorean theorem states that in right triangles, the square of the hypotenuse equals the sum of squares.",
  "Probability measures the likelihood of events occurring, expressed as fractions, decimals, or percentages between zero and one.",
  "Functions describe relationships between input and output values, forming the foundation of advanced mathematical analysis.",
  "Statistics involves collecting, analyzing, and interpreting data to make informed decisions and draw meaningful conclusions.",
  "Trigonometry studies relationships between angles and sides in triangles, with applications in engineering and physics.",
  "The quadratic formula solves second-degree polynomial equations and has wide applications in science and mathematics.",
  "Coordinate geometry combines algebra and geometry to describe points, lines, and curves using numerical coordinates.",
  "Exponential growth occurs when quantities increase by a constant percentage over equal time intervals repeatedly.",
  "Prime numbers have exactly two factors: one and themselves, playing crucial roles in number theory and cryptography.",
];

const MATHEMATICS_HARD = [
  "Calculus studies rates of change and accumulation through derivatives and integrals, revolutionizing science and engineering applications.",
  "Complex numbers extend the real number system to include imaginary units, enabling solutions to previously unsolvable polynomial equations.",
  "Linear algebra examines vector spaces and linear transformations, providing essential tools for modern data science and machine learning.",
  "Group theory abstracts common algebraic structures, revealing deep connections between seemingly unrelated mathematical and physical phenomena.",
  "Differential equations describe relationships between functions and their derivatives, modeling dynamic systems in science and engineering.",
  "Topology studies properties preserved under continuous deformations, bridging geometry and analysis in profound mathematical ways.",
  "Number theory investigates properties of integers and has surprising applications in cryptography and computer science security systems.",
  "Real analysis rigorously examines limits, continuity, and convergence, providing the logical foundation for calculus and mathematical analysis.",
  "Abstract algebra generalizes familiar algebraic structures like groups, rings, and fields to study mathematical systems axiomatically.",
  "Mathematical logic formalizes reasoning and proof techniques, exploring the foundations and limitations of mathematical knowledge itself.",
];

// QuickStart texts - diverse, short texts perfect for 30-60 second races
// Each category represents completely different topics to keep races interesting
const QUICKSTART_TEXTS = [
  // Space & Astronomy (30-45 seconds)
  "The International Space Station orbits Earth every 90 minutes at a speed of 28,000 kilometers per hour. Astronauts experience 16 sunrises and sunsets each day while conducting scientific experiments in microgravity.",
  
  // Cooking & Food Science (35-50 seconds) 
  "When baking bread, gluten proteins form elastic networks that trap carbon dioxide bubbles produced by yeast fermentation. The Maillard reaction creates the golden crust and complex flavors we associate with fresh-baked bread.",
  
  // Ocean Life & Marine Biology (40-55 seconds)
  "Giant Pacific octopuses are incredibly intelligent creatures with three hearts, blue blood, and the ability to change both color and texture instantly. They can solve puzzles, open jars, and recognize individual humans who care for them.",
  
  // Music & Sound Physics (35-50 seconds)
  "Sound waves travel through air by creating pressure variations that our ears detect as vibrations. Musical instruments produce specific frequencies that create harmony when mathematical ratios align perfectly together.",
  
  // Ancient Civilizations (45-60 seconds)
  "The ancient Egyptians built the Great Pyramid of Giza using approximately 2.3 million stone blocks, each weighing between 2.5 and 15 tons. This architectural marvel remained the world's tallest human-made structure for over 3,800 years.",
  
  // Sports & Human Performance (40-55 seconds)
  "Elite marathon runners maintain a pace of approximately 5 minutes per mile for 26.2 miles, requiring exceptional cardiovascular efficiency and mental endurance. Their hearts pump oxygen-rich blood at rates exceeding 180 beats per minute.",
  
  // Weather & Meteorology (35-50 seconds)
  "Lightning bolts reach temperatures of 30,000 Kelvin, which is five times hotter than the surface of the Sun. Thunder is the sound created by rapidly expanding air heated by the electrical discharge.",
  
  // Animal Behavior & Biology (40-55 seconds)
  "Honeybees communicate the location of flower patches through waggle dances that indicate both direction and distance. A single colony can contain up to 80,000 bees working together with remarkable coordination and efficiency.",
  
  // Technology & Innovation (45-60 seconds)
  "Modern smartphones contain more computing power than the computers used for the Apollo moon missions. These pocket-sized devices process billions of calculations per second while maintaining wireless connections to global networks.",
  
  // Art & Cultural History (35-50 seconds)
  "Leonardo da Vinci painted the Mona Lisa using sfumato, a technique involving subtle gradations of light and shadow without harsh outlines. This masterpiece took over four years to complete during the Renaissance period.",
  
  // Plant Biology & Ecology (40-55 seconds)
  "Redwood trees can live for over 2,000 years and grow taller than 350 feet by efficiently transporting water from their roots to their crown through specialized vascular tissue. They create their own weather systems.",
  
  // Psychology & Human Behavior (45-60 seconds)
  "The human brain contains approximately 86 billion neurons connected by trillions of synapses. These neural networks process information, store memories, and generate consciousness through electrochemical signals traveling at incredible speeds.",
  
  // Architecture & Engineering (40-55 seconds)
  "The Golden Gate Bridge in San Francisco spans 1.7 miles and can sway up to 27 feet in strong winds. Its distinctive International Orange color was chosen to enhance visibility in frequent fog conditions.",
  
  // Transportation & Physics (35-50 seconds)
  "Modern jet engines work by compressing air, mixing it with fuel, igniting the mixture, and expelling hot gases through a nozzle. This process generates thrust according to Newton's third law of motion.",
  
  // Geography & Earth Science (45-60 seconds)
  "The Amazon rainforest produces approximately 20% of the world's oxygen and contains more than 40,000 plant species. This biodiversity hotspot influences global climate patterns and weather systems across multiple continents.",
  
  // Fashion & Textile Science (35-50 seconds)
  "Silk fibers produced by silkworms are stronger than steel wire of the same thickness. The process of silk production, called sericulture, has remained largely unchanged for thousands of years.",
  
  // Medicine & Healthcare (40-55 seconds)
  "The human immune system recognizes and fights millions of potential threats through specialized white blood cells. Vaccines work by training this system to recognize and respond quickly to specific pathogens.",
  
  // Communication & Language (35-50 seconds)
  "There are approximately 7,000 spoken languages worldwide, with new dialects constantly evolving. Language shapes thought patterns and cultural perspectives in ways researchers are still discovering today.",
  
  // Energy & Sustainability (45-60 seconds)
  "Solar panels convert sunlight directly into electricity through photovoltaic cells made from silicon semiconductors. Modern panels can convert over 22% of solar energy into usable electrical power with no moving parts required.",
  
  // Gaming & Virtual Reality (40-55 seconds)
  "Virtual reality creates immersive experiences by tracking head movements and displaying stereoscopic images that fool the brain into perceiving three-dimensional environments. This technology has applications beyond entertainment in education and training.",
  
  // Archaeology & Discovery (45-60 seconds)
  "Carbon dating allows scientists to determine the age of organic materials up to 50,000 years old by measuring radioactive carbon-14 decay rates. This technique has revolutionized our understanding of human history and prehistoric life.",
  
  // Mathematics in Nature (40-55 seconds)
  "The Fibonacci sequence appears throughout nature in flower petals, pinecone spirals, and seashell patterns. This mathematical relationship creates the golden ratio, considered aesthetically pleasing across cultures and time periods.",
  
  // Transportation Innovation (35-50 seconds)
  "Electric vehicles use regenerative braking to convert kinetic energy back into electrical energy, extending their range. Advanced battery management systems monitor thousands of individual cells to optimize performance and safety.",
  
  // Neuroscience & Learning (45-60 seconds)
  "Neuroplasticity allows the brain to reorganize and form new neural connections throughout life. This adaptability enables learning, memory formation, and recovery from brain injuries through targeted rehabilitation and practice.",
  
  // Robotics & Automation (40-55 seconds)
  "Modern industrial robots use computer vision and machine learning to perform complex assembly tasks with precision measured in micrometers. These systems can adapt to variations and learn from experience without explicit programming."
];

export function getTextByDifficulty(options: TextOptions, targetLength?: number): string {
  const { difficulty, category = 'general' } = options;
  
  let textPool: string[] = [];
  
  switch (category) {
    case 'programming':
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
      break;
    case 'quotes':
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
      break;
    case 'science':
      switch (difficulty) {
        case 'easy':
          textPool = SCIENCE_EASY;
          break;
        case 'medium':
          textPool = SCIENCE_MEDIUM;
          break;
        case 'hard':
          textPool = SCIENCE_HARD;
          break;
      }
      break;
    case 'literature':
      switch (difficulty) {
        case 'easy':
          textPool = LITERATURE_EASY;
          break;
        case 'medium':
          textPool = LITERATURE_MEDIUM;
          break;
        case 'hard':
          textPool = LITERATURE_HARD;
          break;
      }
      break;
    case 'history':
      switch (difficulty) {
        case 'easy':
          textPool = HISTORY_EASY;
          break;
        case 'medium':
          textPool = HISTORY_MEDIUM;
          break;
        case 'hard':
          textPool = HISTORY_HARD;
          break;
      }
      break;
    case 'business':
      switch (difficulty) {
        case 'easy':
          textPool = BUSINESS_EASY;
          break;
        case 'medium':
          textPool = BUSINESS_MEDIUM;
          break;
        case 'hard':
          textPool = BUSINESS_HARD;
          break;
      }
      break;
    case 'health':
      switch (difficulty) {
        case 'easy':
          textPool = HEALTH_EASY;
          break;
        case 'medium':
          textPool = HEALTH_MEDIUM;
          break;
        case 'hard':
          textPool = HEALTH_HARD;
          break;
      }
      break;
    case 'sports':
      switch (difficulty) {
        case 'easy':
          textPool = SPORTS_EASY;
          break;
        case 'medium':
          textPool = SPORTS_MEDIUM;
          break;
        case 'hard':
          textPool = SPORTS_HARD;
          break;
      }
      break;
    case 'food':
      switch (difficulty) {
        case 'easy':
          textPool = FOOD_EASY;
          break;
        case 'medium':
          textPool = FOOD_MEDIUM;
          break;
        case 'hard':
          textPool = FOOD_HARD;
          break;
      }
      break;
    case 'arts':
      switch (difficulty) {
        case 'easy':
          textPool = ARTS_EASY;
          break;
        case 'medium':
          textPool = ARTS_MEDIUM;
          break;
        case 'hard':
          textPool = ARTS_HARD;
          break;
      }
      break;
    case 'nature':
      switch (difficulty) {
        case 'easy':
          textPool = NATURE_EASY;
          break;
        case 'medium':
          textPool = NATURE_MEDIUM;
          break;
        case 'hard':
          textPool = NATURE_HARD;
          break;
      }
      break;
    case 'mathematics':
      switch (difficulty) {
        case 'easy':
          textPool = MATHEMATICS_EASY;
          break;
        case 'medium':
          textPool = MATHEMATICS_MEDIUM;
          break;
        case 'hard':
          textPool = MATHEMATICS_HARD;
          break;
      }
      break;
    case 'quickstart':
      // For quickstart, ignore difficulty and use diverse short texts
      textPool = QUICKSTART_TEXTS;
      break;
    default:
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
      break;
  }
  
  // If no target length specified, return a single random text
  if (!targetLength) {
    const randomIndex = Math.floor(Math.random() * textPool.length);
    return textPool[randomIndex];
  }
  
  // Generate text to match target length by combining multiple texts
  let combinedText = '';
  const usedTexts = new Set<number>();
  
  while (combinedText.length < targetLength && usedTexts.size < textPool.length) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * textPool.length);
    } while (usedTexts.has(randomIndex));
    
    usedTexts.add(randomIndex);
    const nextText = textPool[randomIndex];
    
    // Add space between texts if not the first one
    if (combinedText.length > 0) {
      combinedText += ' ';
    }
    
    // Check if adding this text would exceed target length significantly
    if (combinedText.length + nextText.length <= targetLength + 50) {
      combinedText += nextText;
    } else {
      // If we're close to target length, try to find a shorter text
      const shorterTexts = textPool.filter((text, index) => 
        !usedTexts.has(index) && 
        text.length <= (targetLength - combinedText.length + 20)
      );
      
      if (shorterTexts.length > 0) {
        const shorterText = shorterTexts[Math.floor(Math.random() * shorterTexts.length)];
        combinedText += shorterText;
      }
      break;
    }
  }
  
  // If still too short, repeat some texts
  if (combinedText.length < targetLength * 0.8) {
    while (combinedText.length < targetLength) {
      const randomIndex = Math.floor(Math.random() * textPool.length);
      const additionalText = textPool[randomIndex];
      
      if (combinedText.length + additionalText.length + 1 <= targetLength + 50) {
        combinedText += ' ' + additionalText;
      } else {
        break;
      }
    }
  }
  
  // Trim to exact target length at word boundary if exceeded
  if (combinedText.length > targetLength) {
    combinedText = combinedText.substring(0, targetLength);
    const lastSpaceIndex = combinedText.lastIndexOf(' ');
    if (lastSpaceIndex > targetLength * 0.9) {
      combinedText = combinedText.substring(0, lastSpaceIndex);
    }
  }
  
  return combinedText;
}

// Get a random text with default easy difficulty
export function getRandomText(): string {
  return getTextByDifficulty({ difficulty: 'easy', category: 'general' });
}

// Get a quick start text - diverse, short texts perfect for 30-60 second races
export function getQuickStartText(): string {
  return getTextByDifficulty({ difficulty: 'easy', category: 'quickstart' });
}
