import React from "react";
import { motion } from "framer-motion";
import { Player } from "../../store/gameStore";

interface PlayerWithPoints extends Player {
  points: number;
}

interface PodiumProps {
  players: PlayerWithPoints[]; // Top 3
}

const Podium: React.FC<PodiumProps> = ({ players }) => {
  const podiumOrder = [1, 0, 2]; // Order to render: 2nd, 1st, 3rd
  const podiumPlayers = podiumOrder.map((index) => players[index]).filter((p) => p);

  const podiumStyles = [
    { height: 150, color: "#c0c0c0", shadow: "rgba(192, 192, 192, 0.4)" }, // 2nd
    { height: 200, color: "#ffd700", shadow: "rgba(255, 215, 0, 0.4)" }, // 1st
    { height: 100, color: "#cd7f32", shadow: "rgba(205, 127, 50, 0.4)" }, // 3rd
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: 4,
        marginBottom: 32,
        width: "100%",
        height: 250,
        position: "relative",
      }}
    >
      {podiumPlayers.map((player, i) => {
        const podiumIndex = podiumOrder.indexOf(i);
        const style = podiumStyles[podiumIndex];
        return (
          <motion.div
            key={player.id}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.2, type: "spring", stiffness: 100 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              width: "33%",
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: style.color,
                marginBottom: 8,
                textShadow: `0 2px 8px ${style.shadow}`,
              }}
            >
              {podiumIndex === 1 ? "🥇" : podiumIndex === 0 ? "🥈" : "🥉"}
            </div>
            <img
              src={player.avatar ? `/images/${player.avatar}` : "/images/Capy-progress-bar-icon.svg"}
              alt="avatar"
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: `4px solid ${player.color || style.color}`,
                background: "#fff",
                objectFit: "cover",
                marginBottom: 12,
                boxShadow: `0 4px 16px ${style.shadow}`,
              }}
            />
            <div
              style={{
                fontWeight: 700,
                fontSize: 20,
                color: "#232323",
                marginBottom: 4,
                textAlign: "center",
              }}
            >
              {player.nickname}
            </div>
            <div
              style={{
                fontSize: 18,
                color: "#b6a77a",
                fontWeight: 700,
              }}
            >
              {player.points} pts
            </div>
            <div
              style={{
                width: "100%",
                height: style.height,
                backgroundColor: style.color,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 48,
                fontWeight: "bold",
                color: "white",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                marginTop: 12,
                boxShadow: `inset 0 4px 12px rgba(0,0,0,0.2), 0 4px 8px ${style.shadow}`,
              }}
            >
              {podiumIndex + 1}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Podium;
