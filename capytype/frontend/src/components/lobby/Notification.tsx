import { notificationStyle } from '../../utils/styles';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationProps {
  show: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'capy-alert';
  duration?: number;
}

export const Notification = ({ show, message, type = 'success' }: NotificationProps) => {
  const getNotificationStyle = () => {
    const baseStyle = { ...notificationStyle };
    
    if (type === 'capy-alert') {
      return {
        ...baseStyle,
        background: 'rgba(239, 68, 68, 0.95)',
        border: '2px solid #dc2626',
        padding: '12px 16px',
        maxWidth: '320px',
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
      };
    }
    
    if (type === 'error') {
      return {
        ...baseStyle,
        background: 'rgba(239, 68, 68, 0.9)',
        border: '2px solid #dc2626',
      };
    }
    
    if (type === 'warning') {
      return {
        ...baseStyle,
        background: 'rgba(245, 158, 11, 0.9)',
        border: '2px solid #d97706',
      };
    }
    
    return baseStyle;
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={getNotificationStyle()}
        >
          {type === 'capy-alert' && (
            <img
              src="/images/capy-face.png"
              alt="Alert Capybara"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '2px solid #fff',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            {type === 'capy-alert' ? (
              <div>
                <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>
                  🐹 CAPY ALERT!
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.3 }}>
                  {message}
                </div>
              </div>
            ) : (
              <>✓ {message}</>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
