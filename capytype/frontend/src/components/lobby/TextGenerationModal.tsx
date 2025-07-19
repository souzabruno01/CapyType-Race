import { motion } from 'framer-motion';
import { modalOverlayStyle, modalContentStyle, selectStyle, modernButtonStyle } from '../../utils/styles';

interface TextGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  customText: string;
  setCustomText: (text: string) => void;
  onGenerateRandom: () => void;
  onStartGame: () => void;
  selectedDifficulty: 'easy' | 'medium' | 'hard';
  setSelectedDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  selectedCategory: 'general' | 'programming' | 'quotes' | 'science' | 'literature' | 'history' | 'business' | 'health' | 'sports' | 'food' | 'arts' | 'nature' | 'mathematics';
  setSelectedCategory: (category: 'general' | 'programming' | 'quotes' | 'science' | 'literature' | 'history' | 'business' | 'health' | 'sports' | 'food' | 'arts' | 'nature' | 'mathematics') => void;
}

export const TextGenerationModal = ({
  isOpen,
  onClose,
  customText,
  setCustomText,
  onGenerateRandom,
  onStartGame,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedCategory,
  setSelectedCategory
}: TextGenerationModalProps) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={modalOverlayStyle}
    >
      <div style={modalContentStyle} className="capy-modal">
        <div style={{ textAlign: 'center', width: '100%', position: 'relative' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: -9,
              right: -9,
              width: 37,
              height: 37,
              borderRadius: '50%',
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 9px rgba(0,0,0,0.15)',
              fontWeight: 700
            }}
            aria-label="Close"
          >
            ×
          </button>
          
          <h2 style={{
            fontSize: '1.84rem',
            fontWeight: 700,
            color: '#232323',
            marginBottom: 7,
            letterSpacing: '1.0px',
            textShadow: '0 1px 4px #fff8'
          }}>
            🏁 Generate Race Text
          </h2>
          <p style={{ color: '#4b5563', marginBottom: 15, fontSize: '16px' }}>
            Create custom text for your typing race
          </p>
        </div>

        {/* Scrollable Content Area */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          width: '100%',
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          padding: '4px'
        }}>
          {/* Difficulty and Category Selectors */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 12, flexShrink: 0 }}>
            {/* Help Text */}
            <div style={{ 
              background: 'rgba(99, 102, 241, 0.1)', 
              border: '1px solid rgba(99, 102, 241, 0.2)', 
              borderRadius: 7, 
              padding: 12,
              textAlign: 'center'
            }}>
              <p style={{ 
                fontSize: 13, 
                color: '#4f46e5', 
                margin: 0, 
                fontWeight: 500 
              }}>
                <strong>Easy:</strong> Simple words, minimal punctuation | <strong>Medium:</strong> Complex vocabulary, standard punctuation | <strong>Hard:</strong> Technical terms, special characters
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'row', gap: 16, justifyContent: 'center' }}>
              {/* Difficulty Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontWeight: 600, 
                  color: '#374151',
                  fontSize: 12,
                  textAlign: 'center'
                }}>
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  style={{
                    ...selectStyle,
                    width: '100%',
                    minWidth: '96px',
                    maxWidth: '120px',
                    border: '2px solid #8b5cf6',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#1f2937',
                    background: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6,9 12,15 18,9\'%3e%3c/polyline%3e%3c/svg%3e") right 11px center / 14px no-repeat, rgba(235, 228, 200, 0.95)',
                    boxShadow: '0 3px 12px rgba(139, 92, 246, 0.2)',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    appearance: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#4f46e5';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#6366f1';
                    e.currentTarget.style.boxShadow = '0 3px 12px rgba(99, 102, 241, 0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#4f46e5';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#6366f1';
                    e.currentTarget.style.boxShadow = '0 3px 12px rgba(99, 102, 241, 0.2)';
                  }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Category Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontWeight: 600, 
                  color: '#374151',
                  fontSize: 12,
                  textAlign: 'center'
                }}>
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as 'general' | 'programming' | 'quotes' | 'science' | 'literature' | 'history' | 'business' | 'health' | 'sports' | 'food' | 'arts' | 'nature' | 'mathematics')}
                  style={{
                    ...selectStyle,
                    width: '100%',
                    minWidth: '96px',
                    maxWidth: '120px',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 245, 245, 0.9) 100%)',
                    border: '2px solid #8b5cf6',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#1f2937',
                    boxShadow: '0 3px 12px rgba(139, 92, 246, 0.2)',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#7c3aed';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#8b5cf6';
                    e.currentTarget.style.boxShadow = '0 3px 12px rgba(139, 92, 246, 0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#7c3aed';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#8b5cf6';
                    e.currentTarget.style.boxShadow = '0 3px 12px rgba(139, 92, 246, 0.2)';
                  }}
                >
                  <option value="general">General</option>
                  <option value="programming">Programming</option>
                  <option value="quotes">Quotes</option>
                  <option value="science">Science</option>
                  <option value="literature">Literature</option>
                  <option value="history">History</option>
                  <option value="business">Business</option>
                  <option value="health">Health</option>
                  <option value="sports">Sports</option>
                  <option value="food">Food</option>
                  <option value="arts">Arts</option>
                  <option value="nature">Nature</option>
                  <option value="mathematics">Mathematics</option>
                </select>
              </div>
            </div>
          </div>

          {/* Text Area */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', minHeight: 120, maxHeight: 200 }}>
            <div style={{ 
              background: 'rgba(99, 102, 241, 0.1)', 
              border: '1px solid rgba(99, 102, 241, 0.2)', 
              borderRadius: 8, 
              padding: 8, 
              marginBottom: 10,
              fontSize: 10,
              color: '#4f46e5',
              lineHeight: 1.3,
              flexShrink: 0
            }}>
              💡 <strong>Tip:</strong> Choose a category and difficulty level, then click "Generate Text" to create typing content. You can also paste your own custom text directly in the text area below.
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 80, maxHeight: 140 }}>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value.substring(0, 2000))}
                placeholder="Write your custom text here or use the 'Generate Text' button to create content based on the selected category and difficulty..."
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: 70,
                  maxHeight: 120,
                  padding: 10,
                  border: '2px solid #b6a77a',
                  borderRadius: 10,
                  fontSize: 12,
                  fontFamily: 'inherit',
                  resize: 'none',
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 2px 8px rgba(182, 167, 122, 0.1)',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  lineHeight: 1.5,
                  boxSizing: 'border-box',
                  wordWrap: 'break-word',
                  overflow: 'auto'
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
                color: '#6b7280',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span>Characters: {customText.length}/2000</span>
                  {customText.length >= 2000 && (
                    <span style={{ color: '#dc2626', fontWeight: 600 }}>
                      Character limit reached
                    </span>
                  )}
                </div>
                {customText.trim() && (
                  <button
                    onClick={() => setCustomText('')}
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(239, 68, 68, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#dc2626';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ef4444';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(239, 68, 68, 0.3)';
                    }}
                    title="Clear text"
                  >
                    🗑️ Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Generation Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            flexShrink: 0,
            marginTop: 8,
            paddingBottom: 4
          }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGenerateRandom}
              style={{
                ...modernButtonStyle,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                width: '100%',
                maxWidth: '320px',
                padding: '12px 20px',
                borderRadius: 12,
                fontWeight: 700,
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
              }}
            >
              🎲 Generate {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Text
            </motion.button>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: '320px',
          flexShrink: 0,
          paddingTop: 12,
          borderTop: '1px solid rgba(182, 167, 122, 0.2)',
          marginTop: 12
        }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            style={{
              ...modernButtonStyle,
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              fontSize: 12,
              padding: '10px 20px',
              borderRadius: 12,
              fontWeight: 700,
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: '1',
              minWidth: '100px',
              boxShadow: '0 3px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: customText.trim() ? 1.02 : 1 }}
            whileTap={{ scale: customText.trim() ? 0.98 : 1 }}
            onClick={onStartGame}
            disabled={!customText.trim()}
            style={{
              ...modernButtonStyle,
              background: !customText.trim() 
                ? '#9ca3af' 
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              fontSize: 12,
              padding: '10px 20px',
              borderRadius: 12,
              fontWeight: 700,
              border: 'none',
              color: '#fff',
              cursor: !customText.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              flex: '1',
              minWidth: '100px',
              opacity: !customText.trim() ? 0.6 : 1,
              boxShadow: !customText.trim() 
                ? '0 2px 8px rgba(156, 163, 175, 0.3)' 
                : '0 3px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            ✅ Start Race
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
