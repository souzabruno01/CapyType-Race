/**
 * Shared styles for lobby components
 */

// Style for modern, rounded, black buttons
export const modernButtonStyle = {
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
} as const;

// Modern, rounded checkbox style that matches the UI
export const modernCheckboxStyle = {
  width: 18,
  height: 18,
  accentColor: '#b6a77a', // warm brown to match the UI theme
  borderRadius: 4,
  border: '1.5px solid #b6a77a',
  background: '#fff',
  marginRight: 8,
  verticalAlign: 'middle',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
} as const;

// CapyType Race title style
export const capyTitleStyle = {
  fontSize: '2.25rem',
  fontWeight: 700,
  color: '#232323', // light black
  marginBottom: 8,
  letterSpacing: '1.2px',
  textAlign: 'center' as const,
  fontFamily: 'inherit',
  textShadow: '0 1px 4px #fff8',
} as const;

// Modal overlay style
export const modalOverlayStyle = {
  position: 'fixed' as const,
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
} as const;

// Modal content style
export const modalContentStyle = {
  width: '95%',
  maxWidth: 480,
  minWidth: 320,
  padding: '16px',
  background: 'rgba(235, 228, 200, 0.95)',
  borderRadius: 21,
  boxShadow: '0 14px 46px rgba(0,0,0,0.2)',
  border: '2px solid #b6a77a',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: 8,
  maxHeight: '95vh',
  minHeight: '400px',
  overflow: 'hidden'
} as const;

// Select input style
export const selectStyle = {
  padding: '9px 13px',
  border: '2px solid #b6a77a',
  borderRadius: 10,
  fontSize: 12,
  fontWeight: 600,
  background: 'rgba(255, 255, 255, 0.95)',
  color: '#374151',
  cursor: 'pointer',
  outline: 'none',
  boxShadow: '0 2px 8px rgba(182, 167, 122, 0.1)',
  transition: 'all 0.2s ease',
  appearance: 'none' as const,
  backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6,9 12,15 18,9\'%3e%3c/polyline%3e%3c/svg%3e")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 11px center',
  backgroundSize: '14px',
  paddingRight: '32px'
} as const;

// Notification style
export const notificationStyle = {
  position: 'fixed' as const,
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
} as const;
