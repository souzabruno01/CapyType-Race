import { useState } from 'react';
import { getTextByDifficulty, getRandomText } from '../utils/textGeneration';

/**
 * Custom hook for text generation functionality
 */
export const useTextGeneration = () => {
  const [customText, setCustomText] = useState('');
  const [characterLimit, setCharacterLimit] = useState(200);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [selectedCategory, setSelectedCategory] = useState<'general' | 'programming' | 'quotes' | 'science' | 'literature' | 'history' | 'business' | 'health' | 'sports' | 'food' | 'arts' | 'nature' | 'mathematics'>('general');

  // Generate random text based on difficulty and category selection
  const generateRandomText = async (): Promise<{ success: boolean; message: string }> => {
    try {
      // Use our curated text generation with selected difficulty and category
      const generatedText = getTextByDifficulty({
        difficulty: selectedDifficulty,
        category: selectedCategory
      }, characterLimit);
      
      if (generatedText && generatedText.length > 20) {
        setCustomText(generatedText);
        return {
          success: true,
          message: `✅ Generated ${selectedDifficulty.toUpperCase()} ${selectedCategory} text (${generatedText.length} chars)`
        };
      } else {
        throw new Error('Generated text is too short');
      }
    } catch (error) {
      console.error('Random text generation failed:', error);
      // Fallback to a simple random text
      const fallbackText = getRandomText();
      setCustomText(fallbackText);
      return {
        success: false,
        message: '⚠️ Using fallback text due to generation error'
      };
    }
  };

  return {
    customText,
    setCustomText,
    characterLimit,
    setCharacterLimit,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedCategory,
    setSelectedCategory,
    generateRandomText
  };
};
