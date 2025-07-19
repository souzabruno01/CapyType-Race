import DOMPurify from 'dompurify';

interface PlayerNameProps {
  /** The player's nickname to display */
  nickname: string;
  /** Font size for the player name */
  fontSize: number;
  /** Optional custom styling overrides */
  style?: React.CSSProperties;
  /** Variant for different contexts */
  variant?: 'lobby' | 'results' | 'game';
  /** Scale factor for responsive sizing (used in results) */
  scaleFactor?: number;
}

/**
 * Shared PlayerName component with consistent styling across the application.
 * Provides a unified way to display player names with proper sanitization,
 * typography, and background highlighting.
 */
export const PlayerName = ({ 
  nickname, 
  fontSize, 
  style = {}, 
  variant = 'lobby',
  scaleFactor = 1 
}: PlayerNameProps) => {
  // Base styles that are consistent across all variants
  const baseStyles: React.CSSProperties = {
    fontSize: Math.round(fontSize * scaleFactor),
    fontWeight: 700,
    color: '#232323',
    wordBreak: 'break-word',
    lineHeight: 1.2,
    background: 'rgba(0, 0, 0, 0.15)',
    padding: `${Math.round(4 * scaleFactor)}px ${Math.round(8 * scaleFactor)}px`,
    borderRadius: `${Math.round(8 * scaleFactor)}px`,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(4px)',
    fontFamily: 'Quilon, serif',
    textAlign: 'center' as const,
  };

  // Variant-specific adjustments
  const variantStyles: Record<string, React.CSSProperties> = {
    lobby: {
      // Standard lobby styling
    },
    results: {
      // Results modal might need different margins
      marginBottom: Math.round(8 * scaleFactor),
    },
    game: {
      // Game view might need smaller padding or different colors
      padding: `${Math.round(2 * scaleFactor)}px ${Math.round(6 * scaleFactor)}px`,
      fontSize: Math.round(fontSize * scaleFactor * 0.9), // Slightly smaller for game view
    }
  };

  // Combine all styles: base + variant + custom overrides
  const finalStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...style
  };

  return (
    <div style={finalStyles}>
      <span 
        dangerouslySetInnerHTML={{ 
          __html: DOMPurify.sanitize(nickname) 
        }} 
      />
    </div>
  );
};

export default PlayerName;
