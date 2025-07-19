import React from 'react';

const HighlightedText = ({ text, input, errorPositions }: { 
  text: string; 
  input: string; 
  errorPositions: Set<number>;
}) => {
  return (
    <div style={{
      fontFamily: 'monospace',
      fontSize: '1.2rem',
      lineHeight: 1.7,
      whiteSpace: 'normal', // Allow text to wrap naturally
      position: 'relative',
      wordBreak: 'normal', // Don't break words in the middle
      overflowWrap: 'anywhere', // Only break if absolutely necessary
      hyphens: 'none' // Disable hyphenation
    }}>
      {text.split('').map((char, index) => {
        const isTyped = index < input.length;
        const isError = errorPositions.has(index);
        const isCurrent = index === input.length;

        const style: React.CSSProperties = {
          transition: 'all 0.15s ease',
          padding: '2px 1px',
          borderRadius: 3,
          position: 'relative'
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

        return (
          <span key={index} style={style}>
            {char === ' ' ? <span>&nbsp;</span> : char}
          </span>
        );
      })}
    </div>
  );
};

export default HighlightedText;
