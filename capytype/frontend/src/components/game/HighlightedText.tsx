import React from 'react';

const HighlightedText = ({ text, input, errorPositions }: { 
  text: string; 
  input: string; 
  errorPositions: Set<number>;
}) => {
  // Split text into words while keeping track of character indices
  const buildWordElements = () => {
    const words: JSX.Element[] = [];
    let currentIndex = 0;
    
    // Split by spaces but keep the spaces
    const tokens = text.split(/(\s+)/);
    
    tokens.forEach((token, tokenIndex) => {
      const wordChars: JSX.Element[] = [];
      
      for (let i = 0; i < token.length; i++) {
        const charIndex = currentIndex + i;
        const char = token[i];
        const isTyped = charIndex < input.length;
        const isError = errorPositions.has(charIndex);
        const isCurrent = charIndex === input.length;

        const style: React.CSSProperties = {
          transition: 'all 0.15s ease',
          padding: '2px 1px',
          borderRadius: 3,
          position: 'relative',
          display: 'inline' // Ensure inline display for proper wrapping
        };

        if (isTyped) {
          if (isError) {
            style.color = '#dc2626'; // Red for errors
            style.background = 'rgba(220, 38, 38, 0.15)';
            style.textDecoration = 'underline';
            style.textDecorationColor = '#ef4444';
          } else {
            style.color = '#10b981'; // Green for correct
            style.background = 'rgba(16, 185, 129, 0.1)';
          }
        } else {
          style.color = '#4b5563'; // Dark gray for untyped
        }

        if (isCurrent) {
          style.boxShadow = '0 0 0 2px #6366f1'; // Caret/cursor
          style.animation = 'pulse 1.2s infinite';
        }

        wordChars.push(
          <span key={charIndex} style={style}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      }
      
      // Wrap each word (or space sequence) in a span with inline-block
      // This allows the browser to treat it as a word for wrapping purposes
      words.push(
        <span 
          key={`word-${tokenIndex}`} 
          style={{ 
            display: 'inline-block',
            whiteSpace: token.trim() === '' ? 'pre' : 'nowrap' // Spaces keep their whitespace, words don't wrap internally
          }}
        >
          {wordChars}
        </span>
      );
      
      currentIndex += token.length;
    });
    
    return words;
  };

  return (
    <div style={{
      fontFamily: 'monospace',
      fontSize: '1.2rem',
      lineHeight: 1.7,
      whiteSpace: 'normal', // Allow text to wrap naturally
      position: 'relative',
      wordWrap: 'break-word', // Break long words if necessary
      overflowWrap: 'break-word', // Modern property for word breaking
      hyphens: 'none', // Disable hyphenation
      userSelect: 'none', // Prevent text selection for anti-cheat
      width: '100%', // Ensure full width usage
      overflow: 'hidden' // Prevent any horizontal overflow
    }}>
      {buildWordElements()}
    </div>
  );
};

export default HighlightedText;
