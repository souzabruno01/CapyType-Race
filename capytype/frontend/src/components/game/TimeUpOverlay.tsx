import { motion } from 'framer-motion';

const TimeUpOverlay = ({ onAnimationComplete }: { 
  onAnimationComplete: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1.5 }}
    onAnimationComplete={onAnimationComplete}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      backdropFilter: 'blur(12px)'
    }}
  >
    <motion.div
      initial={{ scale: 0.3, y: -100, rotateX: -90 }}
      animate={{ scale: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 2.0, type: "spring", stiffness: 60, damping: 15 }}
      style={{
        background: 'rgba(235, 228, 200, 0.98)',
        borderRadius: 24,
        padding: 48,
        textAlign: 'center',
        border: '3px solid #b6a77a',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        maxWidth: '90vw'
      }}
    >
      <motion.h2
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ 
          scale: [0.5, 1.1, 1], 
          opacity: 1,
          rotateZ: [0, -2, 2, 0] 
        }}
        transition={{ duration: 2.5, repeat: 1, ease: "easeInOut" }}
        style={{
          fontSize: '4rem',
          fontWeight: 800,
          color: '#e11d48',
          marginBottom: 16,
          textShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}
      >
        ⏰ TIME'S UP! ⏰
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 1.2 }}
        style={{
          fontSize: '1.5rem',
          color: '#374151',
          fontWeight: 600,
          marginBottom: 24
        }}
      >
        🏁 Calculating final results...
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          rotate: 360 
        }}
        transition={{ 
          delay: 1.5,
          duration: 2.5, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        style={{
          width: 48,
          height: 48,
          border: '5px solid #e5e7eb',
          borderTop: '5px solid #6366f1',
          borderRadius: '50%',
          margin: '0 auto'
        }}
      />
    </motion.div>
  </motion.div>
);

export default TimeUpOverlay;
