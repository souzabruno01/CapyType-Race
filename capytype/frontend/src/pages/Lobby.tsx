import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// Removed unused Button import
import { useGameStore } from '../store/gameStore';
import { generateRoomName } from '../utils/roomUtils';
// Removed unused Player import
import { getAvatarByFile, CAPYBARA_AVATARS } from '../utils/avatars';

// Asset preloading for performance optimization (Step 1.2)
const preloadGameAssets = () => {
  // Preload background image for game page
  const gameBackground = new Image();
  gameBackground.src = '/images/capybara_background_multiple.png';
  
  // Preload all capybara avatars
  CAPYBARA_AVATARS.forEach(avatar => {
    const img = new Image();
    img.src = `/images/${avatar.file}`;
  });
  
  // Preload progress bar icon
  const progressIcon = new Image();
  progressIcon.src = '/images/Capy-progress-bar-icon.svg';
  
  // Preload any other game-specific assets
  const viteIcon = new Image();
  viteIcon.src = '/vite.svg';
};

// Style for modern, rounded, black buttons
const modernButtonStyle = {
  background: '#232323',
  color: '#fff',
  border: 'none',
  borderRadius: 999,
  padding: '12px 28px',
  fontWeight: 700,
  fontSize: 16,
  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
  cursor: 'pointer',
  transition: 'background 0.2s',
  margin: '8px 0',
  letterSpacing: '0.5px',
};

// Modern, rounded, light black checkbox style
const modernCheckboxStyle = {
  width: 20,
  height: 20,
  accentColor: '#232323', // light black
  borderRadius: 6,
  border: '2px solid #232323',
  background: '#fff',
  marginRight: 8,
  verticalAlign: 'middle',
};

// CapyType Race title style
const capyTitleStyle = {
  fontSize: '2.25rem',
  fontWeight: 700,
  color: '#232323', // light black
  marginBottom: 8,
  letterSpacing: '1.2px',
  textAlign: 'center' as const,
  fontFamily: 'inherit',
  textShadow: '0 1px 4px #fff8',
};

// Text Generation Modal Component for Host
const TextGenerationModal = ({ 
  isOpen, 
  onClose, 
  customText, 
  setCustomText, 
  characterLimit, 
  setCharacterLimit, 
  onGenerateRandom, 
  onGenerateWithChatGPT, 
  generatingText, 
  onStartGame 
}: {
  isOpen: boolean;
  onClose: () => void;
  customText: string;
  setCustomText: (text: string) => void;
  characterLimit: number;
  setCharacterLimit: (limit: number) => void;
  onGenerateRandom: () => void;
  onGenerateWithChatGPT: () => void;
  generatingText: boolean;
  onStartGame: () => void;
}) => {
  if (!isOpen) return null;

  const characterLimits = [50, 100, 150, 200, 300, 500];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        padding: 16
      }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50, opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          width: '100%',
          maxWidth: 650,
          padding: 32,
          background: 'rgba(235, 228, 200, 0.95)',
          borderRadius: 20,
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
          border: '2px solid #b6a77a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ textAlign: 'center', width: '100%', position: 'relative' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              fontWeight: 700
            }}
          >
            ×
          </button>
          
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#232323',
            marginBottom: 8,
            letterSpacing: '1.2px',
            textShadow: '0 1px 4px #fff8'
          }}>
            🏁 Generate Race Text
          </h2>
          <p style={{ color: '#4b5563', marginBottom: 16 }}>
            Create custom text for your typing race
          </p>
        </div>

        {/* Character Limit Selector */}
        <div style={{ width: '100%' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontWeight: 600, 
            color: '#374151' 
          }}>
            Character Limit: {characterLimit}
          </label>
          <div style={{ 
            display: 'flex', 
            gap: 8, 
            flexWrap: 'wrap', 
            marginBottom: 16 
          }}>
            {characterLimits.map(limit => (
              <button
                key={limit}
                onClick={() => setCharacterLimit(limit)}
                style={{
                  background: characterLimit === limit ? '#232323' : '#fff',
                  color: characterLimit === limit ? '#fff' : '#232323',
                  border: '1.5px solid #b6a77a',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                {limit}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div style={{ width: '100%' }}>
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.1)', 
            border: '1px solid rgba(99, 102, 241, 0.2)', 
            borderRadius: 8, 
            padding: 12, 
            marginBottom: 12,
            fontSize: 13,
            color: '#4f46e5'
          }}>
            💡 <strong>Tip:</strong> Type a topic or keywords (like "technology", "space", "nature"), then click "AI Expand Text" to generate a complete typing text, or write your full custom text manually.
          </div>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value.substring(0, characterLimit))}
            placeholder="Enter a topic (e.g., 'artificial intelligence', 'ocean exploration', 'ancient history') or write your complete custom text here..."
            style={{
              width: '100%',
              minHeight: 120,
              padding: 16,
              border: '2px solid #b6a77a',
              borderRadius: 12,
              fontSize: 14,
              fontFamily: 'inherit',
              resize: 'vertical',
              background: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#6366f1'}
            onBlur={(e) => e.target.style.borderColor = '#b6a77a'}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: 8,
            fontSize: 12,
            color: '#6b7280'
          }}>
            <span>Characters: {customText.length}/{characterLimit}</span>
            {customText.length >= characterLimit && (
              <span style={{ color: '#dc2626', fontWeight: 600 }}>
                Character limit reached
              </span>
            )}
          </div>
        </div>

        {/* Generation Buttons */}
        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          width: '100%',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onGenerateRandom}
            disabled={generatingText}
            style={{
              background: '#fff',
              color: '#232323',
              border: '2px solid #b6a77a',
              borderRadius: 12,
              padding: '12px 20px',
              fontWeight: 700,
              fontSize: 14,
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              cursor: generatingText ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: generatingText ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            🎲 Random Text
          </button>
          
          <button
            onClick={onGenerateWithChatGPT}
            disabled={generatingText}
            style={{
              background: generatingText ? '#9ca3af' : '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 20px',
              fontWeight: 700,
              fontSize: 14,
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              cursor: generatingText ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            {generatingText ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  ⚡
                </motion.div>
                Generating...
              </>
            ) : (
              <>🤖 AI Expand Text</>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          width: '100%'
        }}>
          <button
            onClick={onClose}
            style={{
              background: '#fff',
              color: '#232323',
              border: '2px solid #b6a77a',
              borderRadius: 12,
              padding: '12px 28px',
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onStartGame}
            disabled={!customText.trim() || generatingText}
            style={{
              background: (!customText.trim() || generatingText) ? '#9ca3af' : '#232323',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 28px',
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              cursor: (!customText.trim() || generatingText) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ✅ Start Race
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function Lobby() {
  const navigate = useNavigate();
  const { roomId, players, isAdmin, gameState, startGame } = useGameStore();
  const [playAlone, setPlayAlone] = useState(false);
  const [roomName, setRoomName] = useState({ readableId: '', fullId: '' });
  const [showFullId, setShowFullId] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [customText, setCustomText] = useState('');
  const [generatingText, setGeneratingText] = useState(false);
  const [characterLimit, setCharacterLimit] = useState(150);

  // Get actual capybara colors from avatars
  const capyColors = CAPYBARA_AVATARS.map(avatar => avatar.color);

  const handleColorChange = (newColor: string, playerId: string) => {
    const socket = useGameStore.getState().socket;
    if (socket) {
      // Find the matching avatar file for this color
      const matchingAvatar = CAPYBARA_AVATARS.find(avatar => avatar.color === newColor);
      
      // If this is the current player, update session storage
      if (socket.id === playerId) {
        sessionStorage.setItem('capy_avatar_color', newColor);
        if (matchingAvatar) {
          sessionStorage.setItem('capy_avatar_file', matchingAvatar.file);
        }
      }
      
      socket.emit('changePlayerColor', { 
        playerId, 
        color: newColor, 
        avatar: matchingAvatar ? matchingAvatar.file : undefined 
      });
      setShowColorPicker(null);
      setNotificationMessage('Color updated!');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    }
  };

  useEffect(() => {
    if (!roomId) {
      console.log('[Lobby] No roomId, redirecting to login');
      navigate('/');
      return;
    }
    
    // Set room name and preload assets
    setRoomName(generateRoomName(roomId));
    
    // Preload game assets while in lobby for performance optimization
    preloadGameAssets();
    
    // Validate the room exists on the server
    const socket = useGameStore.getState().socket;
    if (!socket || !socket.connected) {
      console.log('[Lobby] Socket not connected, reconnecting...');
      useGameStore.getState().connect();
    }
  }, [roomId, navigate]);

  useEffect(() => {
    if (gameState === 'playing') {
      navigate('/game');
    }
  }, [gameState, navigate]);

  useEffect(() => {
    // Warn before leaving if in a room
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (roomId) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? You will be disconnected from the room.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [roomId]);

  useEffect(() => {
    // Check for room closure notification
    const closureReason = sessionStorage.getItem('roomClosureReason');
    if (closureReason) {
      sessionStorage.removeItem('roomClosureReason');
      // Show notification and redirect
      alert(closureReason);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Close color picker when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (showColorPicker && !(event.target as Element).closest('[data-color-picker]')) {
        setShowColorPicker(null);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColorPicker]);



  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBackToLogin = () => {
    // If host and alone in room, close room directly without confirmation
    if (isAdmin && players.length <= 1) {
      const socket = useGameStore.getState().socket;
      if (socket) {
        socket.emit('leaveRoom');
        socket.disconnect();
      }
      useGameStore.getState().resetGame();
      
      // Show notification briefly
      setNotificationMessage('Room closed');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
      
      navigate('/login');
    } else {
      // Show confirmation modal for other cases
      setShowLeaveConfirmation(true);
    }
  };

  const confirmLeave = () => {
    const socket = useGameStore.getState().socket;
    if (socket) {
      socket.emit('leaveRoom');
      socket.disconnect();
    }
    useGameStore.getState().resetGame();
    navigate('/login');
  };

  // Sample texts for random generation
  const SAMPLE_TEXTS = [
    "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is perfect for typing practice.",
    "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat.",
    "To be or not to be, that is the question. Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles.",
    "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity.",
    "All happy families are alike; each unhappy family is unhappy in its own way. Everything was in confusion in the Oblonskys' house.",
    "Space: the final frontier. These are the voyages of the starship Enterprise. Its continuing mission: to explore strange new worlds, to seek out new life and new civilizations.",
    "Technology is best when it brings people together. The art of communication is the language of leadership. Innovation distinguishes between a leader and a follower.",
    "The only way to do great work is to love what you do. Stay hungry, stay foolish. Your time is limited, don't waste it living someone else's life."
  ];

  // Smart truncation function to avoid cutting mid-word or mid-sentence
  const smartTruncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) {
      return text;
    }
    
    // First, try to cut at sentence boundaries
    const sentences = text.split(/[.!?]+/);
    let result = '';
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (!sentence) continue;
      
      const potentialResult = result + (result ? '. ' : '') + sentence + '.';
      
      if (potentialResult.length <= maxLength) {
        result = potentialResult;
      } else {
        break;
      }
    }
    
    // If we have a good sentence-based result, use it
    if (result.length >= maxLength * 0.7) { // At least 70% of desired length
      return result;
    }
    
    // Otherwise, cut at word boundaries
    const words = text.split(' ');
    result = '';
    
    for (let i = 0; i < words.length; i++) {
      const potentialResult = result + (result ? ' ' : '') + words[i];
      
      if (potentialResult.length <= maxLength) {
        result = potentialResult;
      } else {
        break;
      }
    }
    
    // Add proper ending punctuation if missing
    if (result && !result.match(/[.!?]$/)) {
      if (result.length < maxLength - 1) {
        result += '.';
      }
    }
    
    return result || text.substring(0, maxLength); // Fallback to hard cut if all else fails
  };

  // Generate random text from samples
  const generateRandomText = () => {
    const randomText = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
    const truncatedText = smartTruncate(randomText, characterLimit);
    setCustomText(truncatedText);
  };

  // Generate text using Hugging Face Inference API (free)
  const generateWithChatGPT = async () => {
    setGeneratingText(true);
    
    try {
      const userPrompt = customText.trim();
      
      // Create a more effective prompt for text generation models
      const prompt = userPrompt 
        ? `Topic: ${userPrompt}. Write an educational paragraph about this topic in ${characterLimit} characters or less:`
        : `Write an educational paragraph about an interesting topic in ${characterLimit} characters or less:`;

      // Try different models for better text generation
      const models = [
        'gpt2',
        'microsoft/DialoGPT-medium',
        'distilgpt2'
      ];

      let generatedText = '';
      let success = false;

      for (const model of models) {
        try {
          // Add timeout to prevent hanging requests
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                max_length: Math.min(Math.ceil(characterLimit / 2), 512),
                temperature: 0.8,
                do_sample: true,
                top_p: 0.9,
                repetition_penalty: 1.1,
                return_full_text: false
              }
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            
            if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
              generatedText = data[0].generated_text;
            } else if (data.generated_text) {
              generatedText = data.generated_text;
            }

            if (generatedText && generatedText.length > 10) {
              success = true;
              break;
            }
          } else if (response.status === 503) {
            // Model is loading, wait a bit and try next model
            console.log(`Model ${model} is loading, trying next...`);
            continue;
          }
        } catch (modelError) {
          const errorMessage = modelError instanceof Error ? modelError.message : 'Unknown error';
          console.log(`Model ${model} failed:`, errorMessage);
          continue;
        }
      }

      if (!success) {
        throw new Error('All AI models failed');
      }

      // Clean up the generated text
      generatedText = generatedText
        .replace(prompt, '') // Remove prompt if included
        .replace(/^\s*[:.-]\s*/, '') // Remove leading punctuation
        .trim()
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .replace(/\s+/g, ' '); // Normalize whitespace

      // Apply smart truncation
      generatedText = smartTruncate(generatedText, characterLimit);

      if (generatedText.length < 20) {
        throw new Error('Generated text too short after processing');
      }

      setCustomText(generatedText);
      
    } catch (error) {
      console.error('Error generating text with AI:', error);
      
      // Enhanced fallback with topic-aware generation
      const userPrompt = customText.trim().toLowerCase();
      let fallbackText = '';
      
      // Determine text complexity based on character limit
      const isShort = characterLimit <= 100;
      const isMedium = characterLimit > 100 && characterLimit <= 250;
      
      if (userPrompt) {
        if (userPrompt.includes('capybara') || userPrompt.includes('rodent')) {
          fallbackText = isShort 
            ? `Capybaras are the world's largest rodents, native to South America. These gentle giants live near water and are excellent swimmers.`
            : isMedium
            ? `Capybaras are the world's largest rodents, native to South America. These gentle giants live in groups near water bodies like rivers and marshes. With their calm demeanor, they serve as peaceful mediators in the animal kingdom and are beloved by many other species.`
            : `Capybaras are the world's largest rodents, native to South America. These gentle giants live in groups near water bodies like rivers, lakes, and marshes. With their calm demeanor and social nature, capybaras often serve as peaceful mediators in the animal kingdom. They can weigh up to 65 kilograms and are excellent swimmers, using their webbed feet to navigate through water with remarkable grace and efficiency.`;
        } else if (userPrompt.includes('technology') || userPrompt.includes('ai') || userPrompt.includes('computer')) {
          fallbackText = isShort
            ? `Technology revolutionizes how we work and communicate. AI systems analyze data to make predictions and automate complex tasks.`
            : isMedium
            ? `Technology continues to revolutionize how we work, communicate, and solve problems. Machine learning algorithms analyze vast datasets to make predictions and automate complex tasks across industries. These innovations enhance human capabilities and drive progress.`
            : `Technology continues to revolutionize how we work, communicate, and solve complex problems in our daily lives. Machine learning algorithms analyze vast datasets to make accurate predictions and automate intricate tasks across various industries. From healthcare diagnostics to autonomous vehicles, these technological innovations enhance human capabilities and drive unprecedented progress in our modern world.`;
        } else if (userPrompt.includes('nature') || userPrompt.includes('environment')) {
          fallbackText = isShort
            ? `Nature maintains delicate ecosystems that support diverse life forms. Environmental conservation is crucial for future generations.`
            : isMedium
            ? `Nature maintains delicate ecosystems that support countless species across the planet. Environmental conservation efforts are crucial for preserving biodiversity and ensuring sustainable resources for future generations to enjoy.`
            : `Nature maintains intricate ecosystems that support countless species across our planet. From rainforests to coral reefs, these environments provide essential services like oxygen production and climate regulation. Environmental conservation efforts are crucial for preserving biodiversity and ensuring sustainable resources for future generations.`;
        } else if (userPrompt.includes('space') || userPrompt.includes('universe')) {
          fallbackText = isShort
            ? `The universe contains billions of galaxies with countless stars. Space exploration expands human knowledge beyond Earth.`
            : isMedium
            ? `The universe contains billions of galaxies, each with countless stars and planetary systems. Space exploration missions continue to expand human knowledge and reveal the mysteries that lie beyond our home planet Earth.`
            : `The universe contains billions of galaxies, each hosting countless stars and diverse planetary systems. Space exploration missions continue to expand human knowledge, revealing fascinating mysteries about cosmic phenomena, distant worlds, and the fundamental nature of reality that lies far beyond our home planet Earth.`;
        } else {
          // Generic topic-based fallback
          const topic = userPrompt.split(' ')[0];
          const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
          fallbackText = isShort
            ? `${capitalizedTopic} offers fascinating insights and learning opportunities. Understanding this subject enriches our knowledge and perspective.`
            : isMedium
            ? `${capitalizedTopic} represents a fascinating area of study that offers numerous insights and learning opportunities. Understanding this subject helps us appreciate complex relationships and patterns that shape our world.`
            : `${capitalizedTopic} represents a fascinating area of study that offers countless insights and learning opportunities. Understanding this subject helps us appreciate the complex relationships and intricate patterns that shape our world. Through careful exploration and analysis, we can gain valuable knowledge and develop a deeper appreciation for this important topic.`;
        }
      } else {
        // Default fallback when no topic is provided
        fallbackText = isShort
          ? `Learning and discovery drive human progress through curiosity and innovation. Education opens doors to new possibilities.`
          : isMedium
          ? `Learning and discovery drive human progress through curiosity, innovation, and the pursuit of knowledge. Education opens doors to new possibilities and helps us understand the world around us in meaningful ways.`
          : `Learning and discovery drive human progress through curiosity, innovation, and the relentless pursuit of knowledge. Education opens doors to new possibilities and helps us understand the complex world around us in meaningful and transformative ways. Through continuous learning, we expand our horizons and contribute to the advancement of human understanding.`;
      }
      
      // Apply smart truncation to fallback text
      fallbackText = smartTruncate(fallbackText, characterLimit);
      
      setCustomText(fallbackText);
    }
    
    setGeneratingText(false);
  };

  // Handle starting game with custom text
  const handleStartWithCustomText = () => {
    if (customText.trim()) {
      if (playAlone) {
        startGame(customText, true);
      } else {
        startGame(customText);
      }
      setShowTextModal(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'url(/images/capybara_background_multiple.png) no-repeat center center fixed', backgroundSize: 'cover' }}>
      <div style={{ 
        width: '100%', 
        maxWidth: 600, // Increased from 500 to 600
        padding: 32, 
        background: 'rgba(235, 228, 200, 0.64)', 
        borderRadius: 16, 
        boxShadow: '0 4px 32px rgba(0,0,0,0.15)', 
        backdropFilter: 'blur(4px)', 
        border: '1.5px solid #b6a77a', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 24,
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>        <button onClick={handleBackToLogin} style={{ ...modernButtonStyle, alignSelf: 'flex-start', marginBottom: 8, padding: '6px 12px', fontSize: 13 }}>
          ← Back to Login
        </button>
        <div style={{ textAlign: 'center', width: '100%' }}>
          {isAdmin && (
            <div style={{
              background: 'rgba(79, 70, 229, 0.1)',
              color: '#4f46e5',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              marginBottom: 8,
              border: '1px solid rgba(79, 70, 229, 0.2)',
              display: 'inline-block'
            }}>
              👑 Host
            </div>
          )}
          <h2 style={{ ...capyTitleStyle, marginBottom: 4 }}>{roomName.readableId}</h2>
          <p style={{ color: '#4b5563', marginBottom: 12 }}>Waiting for players to join...</p>
        </div>
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', margin: '0 0 8px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb', borderRadius: 1 }} />
          <span style={{ 
            background: 'rgba(220, 210, 170, 0.98)', 
            color: '#374151', 
            padding: '0 12px', 
            borderRadius: 6, 
            display: 'inline-block', 
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', 
            border: '1px solid #b6a77a',
            fontWeight: 500,
            margin: '0 8px'
          }}>
            Room Info
          </span>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb', borderRadius: 1 }} />
        </div>
        <div style={{ width: '100%', marginBottom: 8 }}>
          <button
            onClick={() => setShowFullId(!showFullId)}
            style={{ ...modernButtonStyle, fontSize: 13, background: '#fff', color: '#232323', border: '1.5px solid #b6a77a', borderRadius: 6, margin: 0, padding: '4px 12px', fontWeight: 500, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            {showFullId ? 'Hide ID' : 'Show ID'} ▾
          </button>
          {showFullId && (
            <div style={{ position: 'relative', marginTop: 4 }}>
              <p style={{ fontSize: 13, color: '#6b7280', background: 'rgba(255,255,255,0.85)', padding: 8, borderRadius: 6, fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: 0, border: '1px solid #d1d5db' }}>{roomName.fullId}</p>
              <button
                onClick={handleCopyRoomId}
                style={{ ...modernButtonStyle, position: 'absolute', right: 8, top: 8, fontSize: 12, background: '#fff', color: '#232323', border: '1px solid #b6a77a', borderRadius: 4, margin: 0, padding: '2px 8px', fontWeight: 500 }}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>
        <div style={{ width: '100%' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
            Players ({Array.isArray(players) ? players.length : 0}/32):
          </h2>
          
          {/* Warm brown board style player grid */}
          <div style={{
            background: 'rgba(139, 117, 96, 0.3)', // warm brown with 30% transparency
            borderRadius: 12,
            padding: 20, // Increased from 16 to 20
            border: '2px solid rgba(139, 117, 96, 0.4)',
            boxShadow: '0 2px 8px rgba(139, 117, 96, 0.15)',
            minHeight: 120,
            display: 'flex',
            flexDirection: 'column',
            gap: 12 // Increased from 8 to 12
          }}>
            {Array.isArray(players) && players.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: (() => {
                  const playerCount = players.length;
                  // More conservative sizing to prevent overlap
                  if (playerCount <= 4) return 'repeat(auto-fit, minmax(130px, 1fr))';
                  if (playerCount <= 8) return 'repeat(auto-fit, minmax(110px, 1fr))';
                  if (playerCount <= 12) return 'repeat(auto-fit, minmax(95px, 1fr))';
                  if (playerCount <= 16) return 'repeat(auto-fit, minmax(80px, 1fr))';
                  if (playerCount <= 20) return 'repeat(auto-fit, minmax(75px, 1fr))';
                  if (playerCount <= 24) return 'repeat(auto-fit, minmax(70px, 1fr))';
                  return 'repeat(auto-fit, minmax(65px, 1fr))'; // For 25+ players
                })(),
                gap: (() => {
                  const playerCount = players.length;
                  // Increased gaps to prevent border overlap
                  if (playerCount <= 8) return 16;
                  if (playerCount <= 16) return 14;
                  if (playerCount <= 24) return 12;
                  return 10; // For 25+ players
                })(),
                justifyItems: 'center',
                maxWidth: '100%',
                alignItems: 'start' // Align items to start to prevent stretching
              }}>
                {players.map((player) => {
                  if (!player || typeof player !== 'object') return null;
                  const avatar = getAvatarByFile(player.avatar || '');
                  const playerColor = player.color || avatar.color || '#b6a77a';
                  const currentPlayer = useGameStore.getState().socket?.id === player.id;
                  const playerCount = players.length;
                  
                  // More conservative sizing to prevent overlap
                  const getAdaptiveSize = () => {
                    if (playerCount <= 4) return { minWidth: 125, maxWidth: 145, avatarSize: 50, fontSize: 13 };
                    if (playerCount <= 8) return { minWidth: 105, maxWidth: 125, avatarSize: 45, fontSize: 12 };
                    if (playerCount <= 12) return { minWidth: 90, maxWidth: 110, avatarSize: 40, fontSize: 11 };
                    if (playerCount <= 16) return { minWidth: 75, maxWidth: 90, avatarSize: 36, fontSize: 10 };
                    if (playerCount <= 20) return { minWidth: 70, maxWidth: 85, avatarSize: 32, fontSize: 9 };
                    if (playerCount <= 24) return { minWidth: 65, maxWidth: 80, avatarSize: 28, fontSize: 8 };
                    return { minWidth: 60, maxWidth: 75, avatarSize: 24, fontSize: 8 }; // For 25+ players
                  };
                  
                  const sizes = getAdaptiveSize();
                  
                  return (
                    <div key={player.id || player.nickname} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      padding: playerCount > 16 ? 6 : 8,
                      borderRadius: 10,
                      background: player.progress > 0 
                        ? `linear-gradient(135deg, ${playerColor}60, rgba(79, 70, 229, 0.2))` 
                        : `${playerColor}50`,
                      border: `${playerCount > 16 ? '1px' : '2px'} solid ${playerColor}80`, // Thinner border for many players
                      minWidth: sizes.minWidth,
                      maxWidth: sizes.maxWidth,
                      width: '100%', // Ensure cards fill their grid space properly
                      transition: 'all 0.2s ease',
                      boxShadow: `0 2px 6px ${playerColor}30`,
                      position: 'relative',
                      boxSizing: 'border-box' // Include border in width calculation
                    }}>
                      {/* Edit Color Button - only for current player */}
                      {currentPlayer && (
                        <button
                          onClick={() => setShowColorPicker(showColorPicker === player.id ? null : player.id)}
                          style={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #d1d5db',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: 8,
                            padding: 0,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            zIndex: 10
                          }}
                          title="Edit Color"
                        >
                          ✏️
                        </button>
                      )}

                      {/* Color Picker Dropdown */}
                      {showColorPicker === player.id && (
                        <div 
                          data-color-picker
                          style={{
                            position: 'absolute',
                            top: 22,
                            right: 2,
                            background: '#fff',
                            borderRadius: 8,
                            padding: 10, // Increased padding
                            border: '2px solid #e5e7eb',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 20,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)', // Changed to 5 columns for 10 colors
                            gap: 6, // Increased gap
                            width: 140 // Increased width to accommodate 5 columns
                          }}
                        >
                          {capyColors.map((color, index) => {
                            const avatar = CAPYBARA_AVATARS[index];
                            return (
                              <button
                                key={index}
                                onClick={() => handleColorChange(color, player.id)}
                                style={{
                                  width: 22, // Increased from 20 to 22
                                  height: 22, // Increased from 20 to 22
                                  borderRadius: '50%',
                                  background: color,
                                  border: playerColor === color ? '3px solid #000' : '2px solid #d1d5db',
                                  cursor: 'pointer',
                                  padding: 0,
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                                  transition: 'all 0.2s ease'
                                }}
                                title={`Change to ${avatar?.name || color}`}
                              />
                            );
                          })}
                        </div>
                      )}
                      {/* Avatar */}
                      {player.avatar ? (
                        <div style={{ 
                          width: sizes.avatarSize, 
                          height: sizes.avatarSize, 
                          borderRadius: '50%', 
                          overflow: 'hidden', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          background: `${playerColor}50`, // Increased opacity from 30 to 50
                          border: `2px solid ${playerColor}90`, // Increased border opacity from 80 to 90
                          boxShadow: `0 2px 4px ${playerColor}40` // Increased shadow opacity from 30 to 40
                        }}>
                          <img 
                            src={`/images/${player.avatar}`} 
                            alt="avatar" 
                            style={{ 
                              width: sizes.avatarSize - 4, 
                              height: sizes.avatarSize - 4, 
                              objectFit: 'cover', 
                              borderRadius: '50%' 
                            }} 
                            onError={e => (e.currentTarget.style.opacity = '0.3')} 
                          />
                        </div>
                      ) : (
                        <div style={{ 
                          width: sizes.avatarSize, 
                          height: sizes.avatarSize, 
                          background: `linear-gradient(135deg, ${playerColor} 0%, ${playerColor}80 100%)`, 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: '#fff', 
                          fontWeight: 700, 
                          fontSize: Math.max(sizes.fontSize, 8), // Ensure minimum readable size
                          border: `2px solid ${playerColor}`,
                          boxShadow: `0 2px 4px ${playerColor}40`
                        }}>
                          {typeof player.nickname === "string" ? player.nickname.substring(0, 2).toUpperCase() : ""}
                        </div>
                      )}
                      
                      {/* Player name */}
                      <span style={{ 
                        fontWeight: 700, // Made bold
                        color: '#374151', 
                        fontSize: sizes.fontSize, 
                        textAlign: 'center',
                        lineHeight: '1.2',
                        wordBreak: 'break-word',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textShadow: '0 1px 2px rgba(255,255,255,0.8)' // Added text shadow for readability
                      }}>
                        {typeof player.nickname === 'string' ? player.nickname : ''}
                      </span>
                      
                      {/* Progress indicator */}
                      {player.progress > 0 && (
                        <div style={{ 
                          fontSize: 9, 
                          color: '#fff', 
                          fontWeight: 700,
                          background: `${playerColor}90`, // Use player's color for progress
                          padding: '2px 6px',
                          borderRadius: 6,
                          textAlign: 'center',
                          boxShadow: `0 1px 3px ${playerColor}40`,
                          border: `1px solid ${playerColor}`
                        }}>
                          {Math.round(player.progress)}%
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 80,
                color: '#9ca3af',
                fontSize: 14,
                fontStyle: 'italic'
              }}>
                Waiting for players to join...
              </div>
            )}
          </div>
        </div>
        {isAdmin && (
          <div style={{ width: '100%', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="playAlone"
                checked={playAlone}
                onChange={(e) => setPlayAlone(e.target.checked)}
                style={modernCheckboxStyle}
              />
              <label htmlFor="playAlone" style={{ fontSize: 13, color: '#374151' }}>
                Practice mode (start without waiting)
              </label>
            </div>
            <button 
              disabled={!playAlone && players.length < 2} 
              style={{ ...modernButtonStyle, width: '100%', marginBottom: 0 }}
              onClick={() => setShowTextModal(true)}
            >
              🎮 Generate & Start Race
            </button>
            {!playAlone && players.length < 2 && (
              <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', margin: 0 }}>
                Waiting for more players to join...
              </p>
            )}
          </div>
        )}
        {!isAdmin && (
          <div style={{ width: '100%', textAlign: 'center', color: '#6b7280', fontSize: 14, marginTop: 8 }}>
            Waiting for the host to start the game...
          </div>
        )}
      </div>
      
      {/* Text Generation Modal */}
      <AnimatePresence>
        {showTextModal && (
          <TextGenerationModal
            isOpen={showTextModal}
            onClose={() => setShowTextModal(false)}
            customText={customText}
            setCustomText={setCustomText}
            characterLimit={characterLimit}
            setCharacterLimit={setCharacterLimit}
            onGenerateRandom={generateRandomText}
            onGenerateWithChatGPT={generateWithChatGPT}
            generatingText={generatingText}
            onStartGame={handleStartWithCustomText}
          />
        )}
      </AnimatePresence>
      
      {/* Leave Confirmation Dialog */}
      {showLeaveConfirmation && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0, 0, 0, 0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000 
        }}>
          <div style={{ 
            background: 'rgba(235, 228, 200, 0.98)', 
            borderRadius: 16, 
            padding: 24, 
            maxWidth: 260, 
            width: '90%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)', 
            border: '1.5px solid #b6a77a',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              fontSize: 18, 
              fontWeight: 700, 
              color: '#232323', 
              marginBottom: 16, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 8 
            }}>
              ⚠️ {isAdmin ? 'Close Room?' : 'Leave Room?'}
            </h3>
            <p style={{ 
              color: '#4b5563', 
              marginBottom: 20, 
              lineHeight: 1.5 
            }}>
              {isAdmin 
                ? 'If you leave, this room will be closed and all other players will be disconnected.'
                : 'You will be disconnected from the room and won\'t be able to rejoin with the same link.'
              }
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button 
                onClick={() => setShowLeaveConfirmation(false)}
                style={{ 
                  ...modernButtonStyle, 
                  background: '#fff', 
                  color: '#232323', 
                  border: '1.5px solid #b6a77a',
                  margin: 0,
                  fontSize: 11,
                  padding: '10px 22px'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmLeave}
                style={{ 
                  ...modernButtonStyle, 
                  background: '#dc2626', 
                  margin: 0,
                  fontSize: 11,
                  padding: '10px 22px'
                }}
              >
                {isAdmin ? 'Close Room' : 'Leave Room'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Small notification */}
      {showNotification && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: 'rgba(34, 197, 94, 0.9)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 500,
          zIndex: 1100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          ✓ {notificationMessage}
        </div>
      )}
    </div>
  );
}