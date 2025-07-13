import { motion } from "framer-motion";
import { Player } from "../../store/gameStore";

interface PlayerWithPoints extends Player {
  points: number;
}

const PlayerResultCard = ({ player, index }: { player: PlayerWithPoints; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    style={{
      background: "#fff",
      borderRadius: 16,
      border: `2px solid ${player.color || "#b6a77a"}`,
      boxShadow: "0 2px 8px rgba(182, 167, 122, 0.12)",
      padding: "18px 28px",
      minWidth: 180,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: 8,
    }}
  >
    <img
      src={player.avatar ? `/images/${player.avatar}` : "/images/Capy-progress-bar-icon.svg"}
      alt="avatar"
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        border: `3px solid ${player.color || "#b6a77a"}`,
        background: "#fff",
        objectFit: "cover",
        marginBottom: 8,
      }}
    />
    <div
      style={{
        fontWeight: 700,
        fontSize: 18,
        color: "#232323",
        marginBottom: 2,
      }}
    >
      {player.nickname}
    </div>
    <div
      style={{
        fontSize: 15,
        color: "#6366f1",
        fontWeight: 600,
        marginBottom: 2,
      }}
    >{`${index + 4}th`}</div>
    <div
      style={{
        fontSize: 16,
        color: "#b6a77a",
        fontWeight: 700,
      }}
    >
      {player.points} pts
    </div>
  </motion.div>
);

export default PlayerResultCard;
