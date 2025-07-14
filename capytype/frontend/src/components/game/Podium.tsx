import React from "react";
import { motion } from "framer-motion";
import DOMPurify from 'dompurify';
import { Player } from "../../store/gameStore";
import { FaTachometerAlt, FaExclamationTriangle, FaFlagCheckered } from 'react-icons/fa';

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
    { height: 60, color: "#c0c0c0", shadow: "rgba(192, 192, 192, 0.4)", position: 2 }, // 2nd
    { height: 80, color: "#ffd700", shadow: "rgba(255, 215, 0, 0.4)", position: 1 }, // 1st
    { height: 45, color: "#cd7f32", shadow: "rgba(205, 127, 50, 0.4)", position: 3 }, // 3rd
  ];

  const StatIcon = ({ icon, value, label }: { icon: React.ReactNode, value: any, label: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: '#555' }}>
      {icon}
      <span style={{ fontSize: 11, fontWeight: 700 }}>{value}</span>
      <span style={{ fontSize: 8, fontWeight: 500, textTransform: 'uppercase', color: '#888' }}>{label}</span>
    </div>
  );

  // If no players, don't render anything
  if (players.length === 0) return null;

  // If only one player, show only the winner centered
  if (players.length === 1) {
    const winner = players[0];
    const winnerStyle = podiumStyles[1]; // Gold style for winner
    
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          marginBottom: 24,
          marginTop: 32,
          width: "100%",
          height: 220, // Increased height
        }}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            width: 140, // Increased width
          }}
        >
          <div style={{ fontSize: 20, marginBottom: 4 }}>🥇</div>
          <img
            src={winner.avatar ? `/images/${winner.avatar}` : "/images/Capy-progress-bar-icon.svg"}
            alt="avatar"
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              border: `3px solid ${winner.color || winnerStyle.color}`,
              background: "#fff",
              objectFit: "cover",
              marginBottom: 6,
              boxShadow: `0 4px 12px ${winnerStyle.shadow}`,
            }}
          />
          <div style={{
            fontWeight: 700,
            fontSize: 12,
            color: "#232323",
            marginBottom: 3,
            textAlign: "center",
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(winner.nickname) }} />
          </div>
          <div 
            style={{
              background: "rgba(0, 0, 0, 0.7)",
              borderRadius: 12,
              padding: "4px 10px",
              fontSize: 11,
              color: "#fff",
              fontWeight: 700,
              marginBottom: 6,
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
              border: `1px solid ${winnerStyle.color}40`,
              cursor: 'help'
            }}
            title={`Points Breakdown:\nBase: ${winner.wpm || 0} WPM × 10 = ${(winner.wpm || 0) * 10}\nPenalty: ${winner.errors || 0} errors × 3 = -${(winner.errors || 0) * 3}\nProgress: ${Math.round(winner.progress || 0)}% ÷ 5 = +${Math.round((winner.progress || 0) / 5)}\nSpeed Bonus: ${(winner.wpm || 0) > 60 ? '+50' : '0'} (WPM > 60)\nAccuracy Bonus: ${(winner.errors || 0) === 0 ? '+50' : '0'} (0 errors)\nTotal: ${winner.points} pts`}
          >
            {winner.points} pts
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', gap: 8, marginTop: 8, marginBottom: 8, width: '100%' }}>
            <StatIcon icon={<FaTachometerAlt size={12} />} value={`${winner.wpm}`} label="WPM" />
            <StatIcon icon={<FaExclamationTriangle size={12} />} value={winner.errors} label="Errors" />
            <StatIcon icon={<FaFlagCheckered size={12} />} value={`${Math.round(winner.progress || 0)}%`} label="Progress" />
          </div>
          <div style={{
            width: "100%",
            height: winnerStyle.height,
            backgroundColor: winnerStyle.color,
            borderTopLeftRadius: 6,
            borderTopRightRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: "bold",
            color: "white",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            boxShadow: `inset 0 2px 8px rgba(0,0,0,0.2), 0 2px 6px ${winnerStyle.shadow}`,
          }}>
            1
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: 8,
        marginBottom: 24,
        marginTop: 32,
        width: "100%",
        height: 220, // Increased height
      }}
    >
      {podiumPlayers.map((player, i) => {
        const podiumIndex = podiumOrder.indexOf(i);
        const style = podiumStyles[podiumIndex];
        return (
          <motion.div
            key={player.id}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.2, type: "spring", stiffness: 120 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              width: "33%",
              maxWidth: 120,
              minWidth: 80,
            }}
          >
            <div style={{
              fontSize: 18,
              fontWeight: 800,
              color: style.color,
              marginBottom: 4,
              textShadow: `0 2px 6px ${style.shadow}`,
            }}>
              {style.position === 1 ? "🥇" : style.position === 2 ? "🥈" : "🥉"}
            </div>
            <img
              src={player.avatar ? `/images/${player.avatar}` : "/images/Capy-progress-bar-icon.svg"}
              alt="avatar"
              style={{
                width: 45,
                height: 45,
                borderRadius: "50%",
                border: `3px solid ${player.color || style.color}`,
                background: "#fff",
                objectFit: "cover",
                marginBottom: 6,
                boxShadow: `0 3px 10px ${style.shadow}`,
              }}
            />
            <div style={{
              fontWeight: 700,
              fontSize: 11,
              color: "#232323",
              marginBottom: 3,
              textAlign: "center",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(player.nickname) }} />
            </div>
            <div 
              style={{
                background: "rgba(0, 0, 0, 0.7)",
                borderRadius: 10,
                padding: "3px 8px",
                fontSize: 10,
                color: "#fff",
                fontWeight: 700,
                marginBottom: 6,
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
                border: `1px solid ${style.color}40`,
                cursor: 'help'
              }}
              title={`Points Breakdown:\nBase: ${player.wpm || 0} WPM × 10 = ${(player.wpm || 0) * 10}\nPenalty: ${player.errors || 0} errors × 3 = -${(player.errors || 0) * 3}\nProgress: ${Math.round(player.progress || 0)}% ÷ 5 = +${Math.round((player.progress || 0) / 5)}\nSpeed Bonus: ${(player.wpm || 0) > 60 ? '+50' : '0'} (WPM > 60)\nAccuracy Bonus: ${(player.errors || 0) === 0 ? '+50' : '0'} (0 errors)\nTotal: ${player.points} pts`}
            >
              {player.points} pts
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', gap: 4, marginTop: 6, marginBottom: 8, width: '100%' }}>
              <StatIcon icon={<FaTachometerAlt size={10} />} value={`${player.wpm}`} label="WPM" />
              <StatIcon icon={<FaExclamationTriangle size={10} />} value={player.errors} label="Errors" />
              <StatIcon icon={<FaFlagCheckered size={10} />} value={`${Math.round(player.progress || 0)}%`} label="Progress" />
            </div>
            <div style={{
              width: "100%",
              height: style.height,
              backgroundColor: style.color,
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: "bold",
              color: "white",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              boxShadow: `inset 0 2px 8px rgba(0,0,0,0.2), 0 2px 6px ${style.shadow}`,
            }}>
              {style.position}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Podium;
