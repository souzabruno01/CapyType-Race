import { motion } from "framer-motion";
import DOMPurify from 'dompurify';
import { Player } from "../../store/gameStore";

interface PlayerWithPointsAndPosition extends Player {
  points: number;
  position: number;
}

const PlayerResultCard = ({ player, index }: { player: PlayerWithPointsAndPosition; index: number }) => {
  // Helper function to make player color transparent
  const makeColorTransparent = (color: string, opacity: number = 0.15) => {
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  };

  // Calculate 30% size reduction for 4th place and beyond
  const isSmallCard = player.position >= 4;
  const scaleFactor = isSmallCard ? 0.7 : 1.0; // 30% smaller for 4th+
  
  // Scale all dimensions
  const scaledDimensions = {
    padding: `${Math.round(16 * scaleFactor)}px ${Math.round(20 * scaleFactor)}px`,
    minWidth: Math.round(180 * scaleFactor),
    maxWidth: Math.round(200 * scaleFactor),
    borderRadius: Math.round(16 * scaleFactor),
    avatar: Math.round(56 * scaleFactor),
    marginBottom: Math.round(12 * scaleFactor),
    marginTop: Math.round(8 * scaleFactor),
    // Font sizes
    nameSize: Math.round(16 * scaleFactor),
    statsSize: Math.round(13 * scaleFactor),
    pointsSize: Math.round(16 * scaleFactor),
    positionSize: Math.round(12 * scaleFactor),
    trophySize: Math.round(20 * scaleFactor),
    gap: Math.round(4 * scaleFactor),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 + index * 0.1 }} // Delay after podium animations
      style={{
        // CHANGED: Use transparent player color instead of white background
        background: makeColorTransparent(player.color || "#b6a77a", 0.15),
        borderRadius: scaledDimensions.borderRadius,
        border: `3px solid ${player.color || "#b6a77a"}`,
        boxShadow: `0 4px 12px ${player.color ? `${player.color}40` : "rgba(182, 167, 122, 0.2)"}`,
        // CHANGED: Use scaled padding for size reduction
        padding: scaledDimensions.padding,
        // CHANGED: Use scaled width for size reduction
        minWidth: scaledDimensions.minWidth,
        maxWidth: scaledDimensions.maxWidth,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: scaledDimensions.marginBottom,
        position: "relative",
      }}
    >
      {/* Trophy for non-podium finishers */}
    <div style={{
      position: "absolute",
      top: 8,
      right: 8,
      fontSize: scaledDimensions.trophySize,
    }}>
      🏆
    </div>
    
    {/* Position */}
    <div style={{
      position: "absolute",
      top: 8,
      left: 8,
      background: player.color || "#b6a77a",
      color: "#fff",
      borderRadius: 12,
      padding: "4px 8px",
      fontSize: scaledDimensions.positionSize,
      fontWeight: 700,
    }}>
      #{player.position}
    </div>

    <img
      src={player.avatar ? `/images/${player.avatar}` : "/images/Capy-progress-bar-icon.svg"}
      alt="avatar"
      style={{
        width: scaledDimensions.avatar,
        height: scaledDimensions.avatar,
        borderRadius: "50%",
        border: `4px solid ${player.color || "#b6a77a"}`,
        background: "#fff",
        objectFit: "cover",
        marginBottom: scaledDimensions.marginBottom,
        marginTop: scaledDimensions.marginTop,
      }}
    />
    
    <div style={{
      fontWeight: 700,
      fontSize: scaledDimensions.nameSize,
      color: "#232323",
      marginBottom: 8,
      textAlign: "center",
      lineHeight: 1.2,
    }}>
      <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(player.nickname) }} />
    </div>
    
    {/* Stats section */}
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: scaledDimensions.gap,
      width: "100%",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        fontSize: scaledDimensions.statsSize,
        color: "#666",
      }}>
        <span>WPM: <strong>{player.wpm || 0}</strong></span>
        <span>Errors: <strong>{player.errors || 0}</strong></span>
      </div>
      
      <div style={{
        background: `linear-gradient(135deg, ${player.color || "#b6a77a"}, ${player.color || "#b6a77a"}dd)`,
        borderRadius: Math.round(16 * scaleFactor),
        padding: `${Math.round(6 * scaleFactor)}px ${Math.round(12 * scaleFactor)}px`,
        fontSize: scaledDimensions.pointsSize,
        color: "#fff",
        fontWeight: 700,
        marginTop: 4,
        boxShadow: `0 2px 8px ${player.color || "#b6a77a"}40`,
        textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      }}>
        {player.points} pts
      </div>
    </div>
  </motion.div>
  );
};

export default PlayerResultCard;
