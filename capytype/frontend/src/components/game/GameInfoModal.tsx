import React from "react";

interface GameInfoModalProps {
  open: boolean;
  onClose: () => void;
}

const GameInfoModal: React.FC<GameInfoModalProps> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="bg-white rounded-t-2xl shadow-lg p-6 w-full max-w-md capy-modal relative animate-fadeInUp">
        <button
          className="absolute top-2 right-2 text-[#6366f1] text-xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-2 text-[#6366f1]">How the Game Works</h2>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>Type the given text as fast and accurately as possible.</li>
          <li>Points are awarded for speed and accuracy.</li>
          <li>Leaving the race forfeits your position.</li>
          <li>Leaderboard updates in real time as players type.</li>
          <li>Top 3 players are shown on the podium at the end.</li>
        </ul>
        <div className="mt-4 text-xs text-gray-500">
          <b>Scoring:</b> Points = (Words per minute × Accuracy%) + Bonus for finishing early.
        </div>
      </div>
    </div>
  );
};

export default GameInfoModal;
