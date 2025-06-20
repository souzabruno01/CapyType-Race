import { useState } from 'react';

const SAMPLE_TEXTS = [
  {
    category: 'Technology',
    text: 'Artificial Intelligence is transforming our daily lives. From smart assistants to autonomous vehicles, AI systems are becoming more sophisticated. Machine learning helps analyze complex data patterns, leading to innovations in healthcare and scientific research.'
  },
  {
    category: 'Technology',
    text: 'Blockchain technology creates secure, decentralized ledgers for digital transactions. This innovation powers cryptocurrencies and has potential applications in supply chain management and digital identity verification.'
  },
  {
    category: 'Capybaras',
    text: 'Capybaras are the world\'s largest rodents, native to South America. These gentle giants can grow up to 4 feet long and weigh over 100 pounds. They are highly social animals, often found in groups of 10-20 individuals.'
  },
  {
    category: 'Capybaras',
    text: 'Capybaras have a unique social structure, living in groups called herds. They communicate through various sounds and spend most of their time grazing. Their webbed feet make them excellent swimmers.'
  },
  {
    category: 'Travel',
    text: 'Traveling opens our minds to new cultures and experiences. Whether exploring ancient ruins or tasting local cuisine, each journey enriches our understanding of the world and creates lasting memories.'
  }
];

export default function Admin() {
  const [texts, setTexts] = useState(SAMPLE_TEXTS);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');

  const validateText = (text: string) => {
    const length = text.trim().length;
    if (length < 50) {
      return 'Text must be at least 50 characters long';
    }
    if (length > 300) {
      return 'Text must not exceed 300 characters';
    }
    return '';
  };

  const handleAddText = () => {
    const validationError = validateText(newText);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (newText.trim() && newCategory.trim()) {
      setTexts([...texts, { category: newCategory, text: newText }]);
      setNewText('');
      setNewCategory('');
      setError('');
    }
  };

  const handleDeleteText = (index: number) => {
    setTexts(texts.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <h1 className="text-2xl font-bold text-blue-600">Admin Panel - Game Texts</h1>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Add New Text</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter category (e.g., Technology, Capybaras, Travel)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Text</label>
                <textarea
                  value={newText}
                  onChange={(e) => {
                    setNewText(e.target.value);
                    setError(validateText(e.target.value));
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter the text for the typing game (50-300 characters)..."
                />
                <div className="flex justify-between mt-1">
                  <span className={`text-sm ${newText.length < 50 || newText.length > 300 ? 'text-red-600' : 'text-green-600'}`}>
                    {newText.length}/300 characters
                  </span>
                  {error && <span className="text-sm text-red-600">{error}</span>}
                </div>
              </div>
              <button
                onClick={handleAddText}
                disabled={!!error || !newText.trim() || !newCategory.trim()}
                className={`px-4 py-2 text-white rounded-md ${
                  error || !newText.trim() || !newCategory.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Add Text
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Current Texts</h2>
            <div className="space-y-4">
              {texts.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                      <p className="mt-2 text-gray-700">{item.text}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {item.text.length} characters
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteText(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 