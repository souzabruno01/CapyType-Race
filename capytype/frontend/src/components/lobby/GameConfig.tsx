import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface GameConfigProps {
  onStartGame: (options: {
    text?: string;
    category?: string;
    difficulty?: string;
  }) => void;
  disabled?: boolean;
  customText?: string;
  onCustomTextChange?: (text: string) => void;
}

const categories = [
  { value: '', label: '🎲 Random Category', description: 'Surprise me!' },
  { value: 'quotes', label: '💭 Inspirational Quotes', description: 'Famous quotes and sayings' },
  { value: 'code', label: '💻 Code Snippets', description: 'Programming challenges' },
  { value: 'facts', label: '🧠 Fun Facts', description: 'Educational content' },
  { value: 'stories', label: '📖 Short Stories', description: 'Creative narratives' },
  { value: 'technical', label: '⚙️ Technical Text', description: 'Tech documentation' },
  { value: 'literature', label: '📚 Literature', description: 'Classic literary excerpts' },
];

const difficulties = [
  { value: '', label: '🎯 Auto Difficulty', description: 'Balanced challenge' },
  { value: 'easy', label: '🟢 Easy', description: 'Simple words and structure' },
  { value: 'medium', label: '🟡 Medium', description: 'Moderate complexity' },
  { value: 'hard', label: '🔴 Hard', description: 'Complex text with punctuation' },
];

export const GameConfig: React.FC<GameConfigProps> = ({
  onStartGame,
  disabled = false,
  customText = '',
  onCustomTextChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [useCustomText, setUseCustomText] = useState(false);

  const handleStartGame = () => {
    if (useCustomText && customText.trim()) {
      onStartGame({ text: customText.trim() });
    } else {
      onStartGame({
        category: selectedCategory || undefined,
        difficulty: selectedDifficulty || undefined,
      });
    }
  };

  const canStart = !disabled && (useCustomText ? customText.trim().length >= 10 : true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
    >
      <h3 className="text-xl font-bold text-slate-100 mb-4 text-center">
        🏁 Race Configuration
      </h3>

      {/* Toggle between auto-generated and custom text */}
      <div className="flex gap-2 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setUseCustomText(false)}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            !useCustomText
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          🎲 Auto-Generated
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setUseCustomText(true)}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            useCustomText
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          ✏️ Custom Text
        </motion.button>
      </div>

      {useCustomText ? (
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Custom Race Text (min. 10 characters)
          </label>
          <textarea
            value={customText}
            onChange={(e) => onCustomTextChange?.(e.target.value)}
            placeholder="Enter your custom race text here..."
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            rows={4}
            maxLength={2000}
          />
          <div className="text-xs text-slate-400 mt-1">
            {customText.length}/2000 characters
            {customText.length < 10 && (
              <span className="text-yellow-400 ml-2">
                Need at least {10 - customText.length} more characters
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Text Category
            </label>
            <div className="grid grid-cols-1 gap-2">
              {categories.map((category) => (
                <motion.button
                  key={category.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedCategory === category.value
                      ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                      : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  <div className="font-medium">{category.label}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {category.description}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Difficulty Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {difficulties.map((difficulty) => (
                <motion.button
                  key={difficulty.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDifficulty(difficulty.value)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedDifficulty === difficulty.value
                      ? 'bg-green-600/20 border-green-500 text-green-200'
                      : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  <div className="font-medium text-sm">{difficulty.label}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {difficulty.description}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Start Game Button */}
      <motion.button
        whileHover={{ scale: canStart ? 1.02 : 1 }}
        whileTap={{ scale: canStart ? 0.98 : 1 }}
        onClick={handleStartGame}
        disabled={!canStart}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all ${
          canStart
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
        }`}
      >
        {disabled
          ? '⏳ Waiting...'
          : useCustomText
          ? '🚀 Start Custom Race'
          : '🎲 Start Generated Race'}
      </motion.button>

      {!useCustomText && (
        <div className="mt-3 text-center text-xs text-slate-400">
          Text will be automatically generated based on your preferences
        </div>
      )}
    </motion.div>
  );
};
