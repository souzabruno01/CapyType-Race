import { motion } from 'framer-motion';
import { modernButtonStyle } from '../../utils/styles';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  isDestructive = false
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

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
        backdropFilter: 'blur(4px)'
      }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50, opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          width: '90%',
          maxWidth: 400,
          padding: 24,
          background: 'rgba(235, 228, 200, 0.95)',
          borderRadius: 21,
          boxShadow: '0 14px 46px rgba(0,0,0,0.2)',
          border: '2px solid #b6a77a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
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
          {isDestructive ? '⚠️' : '❓'} {title}
        </h3>
        <p style={{ 
          color: '#4b5563', 
          marginBottom: 20, 
          lineHeight: 1.5,
          textAlign: 'center'
        }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button 
            onClick={onClose}
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
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            style={{ 
              ...modernButtonStyle, 
              background: isDestructive ? '#dc2626' : '#232323', 
              margin: 0,
              fontSize: 11,
              padding: '10px 22px'
            }}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
