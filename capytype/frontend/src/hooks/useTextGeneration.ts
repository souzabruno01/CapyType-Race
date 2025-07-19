import { useState } from 'react';
import { getTextByDifficulty, getRandomText, getQuickStartText } from '../utils/textGeneration';

// Use the same backend URL pattern as gameStore
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Custom hook for text generation functionality
 */
export const useTextGeneration = () => {
  const [customText, setCustomText] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [selectedCategory, setSelectedCategory] = useState<'general' | 'programming' | 'quotes' | 'science' | 'literature' | 'history' | 'business' | 'health' | 'sports' | 'food' | 'arts' | 'nature' | 'mathematics'>('general');
  const [generatingText, setGeneratingText] = useState(false);

  // Generate random text based on difficulty and category selection
  const generateRandomText = async (): Promise<{ success: boolean; message: string }> => {
    try {
      setGeneratingText(true);
      
      // Map frontend categories to backend categories
      const categoryMapping: Record<string, string> = {
        'general': 'quotes',
        'programming': 'code',
        'quotes': 'quotes',
        'science': 'facts',
        'literature': 'literature',
        'history': 'stories',
        'business': 'technical',
        'health': 'facts',
        'sports': 'stories',
        'food': 'stories',
        'arts': 'literature',
        'nature': 'facts',
        'mathematics': 'technical'
      };

      // Call the backend text generation endpoint
      const response = await fetch(`${VITE_BACKEND_URL}/api/generate-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: categoryMapping[selectedCategory] || 'quotes',
          difficulty: selectedDifficulty
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend call failed: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.text;
      
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
      console.error('Backend text generation failed:', error);
      // Fallback to local text generation
      const generatedText = getTextByDifficulty({
        difficulty: selectedDifficulty,
        category: selectedCategory
      });
      
      if (generatedText && generatedText.length > 20) {
        setCustomText(generatedText);
        return {
          success: true,
          message: `⚠️ Using fallback text (${generatedText.length} chars)`
        };
      }
      
      // Final fallback to simple random text
      const fallbackText = getRandomText();
      setCustomText(fallbackText);
      return {
        success: false,
        message: '⚠️ Using basic fallback text due to generation error'
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

  // Generate quick start text - diverse, short texts perfect for 30-60 second races
  const generateQuickStartText = async (): Promise<{ success: boolean; message: string }> => {
    setGeneratingText(true);
    try {
      // Use the dedicated quickstart text collection
      const generatedText = getQuickStartText();
      
      if (generatedText && generatedText.length > 20) {
        setCustomText(generatedText);
        return {
          success: true,
          message: `🚀 Generated QuickStart text (${generatedText.length} chars) - Perfect for 30-60 second races!`
        };
      } else {
        throw new Error('Generated quickstart text is too short');
      }
    } catch (error) {
      console.error('QuickStart text generation failed:', error);
      // Final fallback to simple random text
      const fallbackText = getRandomText();
      setCustomText(fallbackText);
      return {
        success: false,
        message: '⚠️ Using basic fallback text due to generation error'
      };
    } finally {
      setGeneratingText(false);
    }
  };

  return {
    customText,
    setCustomText,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedCategory,
    setSelectedCategory,
    generatingText,
    generateRandomText,
    generateWithChatGPT,
    generateQuickStartText
  };
};
