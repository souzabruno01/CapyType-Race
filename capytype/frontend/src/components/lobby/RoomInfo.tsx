import { motion } from 'framer-motion';

interface RoomInfoProps {
  roomId: string;
  roomName: { readableId: string; fullId: string };
  showFullId: boolean;
  setShowFullId: (show: boolean) => void;
  copied: boolean;
  setCopied: (copied: boolean) => void;
}

export const RoomInfo = ({
  roomId,
  roomName,
  showFullId,
  setShowFullId,
  copied,
  setCopied
}: RoomInfoProps) => {
  const handleCopyRoomId = () => {
    if (roomId) {
      // Copy the plain UUID room code
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      marginBottom: 20
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1.5px solid #b6a77a',
          borderRadius: 12,
          padding: '8px 14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(8px)'
        }}>
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#4b5563',
            marginRight: 8
          }}>
            Room:
          </span>
          <span style={{
            fontSize: 14,
            fontWeight: 700,
            color: '#232323',
            fontFamily: 'monospace',
            letterSpacing: '0.5px'
          }}>
            {showFullId ? roomName.fullId : roomName.readableId}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFullId(!showFullId)}
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              color: '#4f46e5',
              border: '1.5px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            {showFullId ? '🔤' : '🆔'} {showFullId ? 'Short' : 'Full'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyRoomId}
            style={{
              background: copied ? 'rgba(34, 197, 94, 0.1)' : 'rgba(99, 102, 241, 0.1)',
              color: copied ? '#059669' : '#4f46e5',
              border: copied ? '1.5px solid rgba(34, 197, 94, 0.3)' : '1.5px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            {copied ? '✅' : '📋'} {copied ? 'Copied!' : 'Copy'}
          </motion.button>
        </div>
      </div>

      <p style={{
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
        margin: 0,
        maxWidth: 400,
        lineHeight: 1.4
      }}>
        Share this room code with friends to invite them to the race
      </p>
    </div>
  );
};
