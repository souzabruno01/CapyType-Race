import { motion } from "framer-motion";
import DOMPurify from 'dompurify';
import { Player } from "../../store/gameStore";

interface PlayerWithPointsAndPosition extends Player {
  points: number;
  position: number;
}

const PlayerResultCard = ({ player, index }: { player: PlayerWithPointsAndPosition; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    style={{
      background: "#fff",
      borderRadius: 16,
      border: `3px solid ${player.color || "#b6a77a"}`,
      boxShadow: `0 4px 12px ${player.color ? `${player.color}40` : "rgba(182, 167, 122, 0.2)"}`,
      padding: "20px 24px",
      minWidth: 200,
      maxWidth: 240,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: 12,
      position: "relative",
    }}
  >
    {/* Trophy for non-podium finishers */}
    <div style={{
      position: "absolute",
      top: 8,
      right: 8,
      fontSize: 20,
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
      fontSize: 12,
      fontWeight: 700,
    }}>
      #{player.position}
    </div>

    <img
      src={player.avatar ? `/images/${player.avatar}` : "/images/Capy-progress-bar-icon.svg"}
      alt="avatar"
      style={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        border: `4px solid ${player.color || "#b6a77a"}`,
        background: "#fff",
        objectFit: "cover",
        marginBottom: 12,
        marginTop: 8,
      }}
    />
    
    <div style={{
      fontWeight: 700,
      fontSize: 16,
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
      gap: 4,
      width: "100%",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        fontSize: 13,
        color: "#666",
      }}>
        <span>WPM: <strong>{player.wpm || 0}</strong></span>
        <span>Errors: <strong>{player.errors || 0}</strong></span>
      </div>
      
      <div style={{
        fontSize: 16,
        color: player.color || "#b6a77a",
        fontWeight: 700,
        marginTop: 4,
      }}>
        {player.points} points
      </div>
    </div>
  </motion.div>
);

export default PlayerResultCard;
