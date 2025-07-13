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
  const [generatingText, setGeneratingText] = useState(false);

  // Generate random text based on difficulty and category selection
  const generateRandomText = async (): Promise<{ success: boolean; message: string }> => {
    try {
      setGeneratingText(true);
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
    } finally {
      setGeneratingText(false);
    }
  };

  // Placeholder for ChatGPT generation (not implemented)
  const generateWithChatGPT = async (): Promise<{ success: boolean; message: string }> => {
    setGeneratingText(true);
    try {
      // For now, fall back to random text generation
      const result = await generateRandomText();
      return {
        success: result.success,
        message: result.success ? '✅ Generated text using fallback method' : result.message
      };
    } finally {
      setGeneratingText(false);
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
    generatingText,
    generateRandomText,
    generateWithChatGPT
  };
};
