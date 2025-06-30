import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { motion } from 'framer-motion';

export default function Results() {
  const navigate = useNavigate();
  const { gameResults, players } = useGameStore();

  useEffect(() => {
    if (!gameResults || gameResults.length === 0) {
      navigate('/lobby');
    }
  }, [gameResults, navigate]);

  // Merge player info (avatar, color, progress) into results for display
  const mergedResults = (gameResults || []).map(result => {
    const player = players.find(p => p.id === result.id);
    return {
      ...result,
      avatar: player?.avatar,
      color: player?.color,
      progress: player?.progress,
    };
  });

  // Assume socket id is available for current user highlight
  const socketId = useGameStore.getState().socket?.id;
  const sortedResults = [...mergedResults].sort((a, b) => a.position - b.position);

  return (
    <div className="min-h-screen w-full flex items-end justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center justify-center"
        style={{
          maxWidth: '90vw',
          width: 'fit-content',
          minWidth: '70vw',
          backdropFilter: 'blur(6px)',
          backgroundColor: 'rgba(255,255,255,0.85)',
          borderRadius: '1.5rem',
          boxShadow: '0 8px 40px rgba(80,60,120,0.18)',
          border: '2px solid #b6a77a',
          padding: '2rem 2.5rem',
        }}
      >
        <h2 className="text-3xl font-bold text-indigo-600 mb-4 text-center">
          Resultados da Corrida 🏁
        </h2>
        <div className="flex flex-wrap justify-center gap-6 mb-6 w-full">
          {sortedResults.map((result, index) => {
            const isCurrentUser = result.id === socketId;
            return (
              <div
                key={result.id}
                className={`flex flex-col items-center p-4 rounded-lg shadow-md transition-all duration-300 ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-purple-200 to-indigo-200 border-2 border-indigo-500'
                    : 'bg-gray-50 border border-gray-200'
                }`}
                style={{
                  minWidth: '180px',
                  flexGrow: 1,
                  maxWidth: '250px',
                }}
              >
                {/* Avatar placeholder, replace with <CapybaraIcon avatar={result.avatar} color={result.color} /> if available */}
                <div
                  className="w-14 h-14 rounded-full mb-2 border-4"
                  style={{
                    background: result.color || '#eee',
                    borderColor: result.color || '#b6a77a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {result.avatar ? (
                    <img
                      src={
                        typeof result.avatar === 'string'
                          ? `/images/${result.avatar}`
                          : result.avatar
                      }
                      alt="avatar"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">🐹</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800 mt-1 text-lg">
                  {result.nickname || 'Jogador'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-bold text-indigo-700">
                    {index + 1}º Lugar
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Progresso:{' '}
                  <span className="font-bold text-green-600">
                    {typeof result.progress === 'number'
                      ? Math.round(result.progress)
                      : 0}
                    %
                  </span>
                </p>
                {result.wpm !== undefined && (
                  <p className="text-sm text-gray-600">
                    WPM:{' '}
                    <span className="font-bold text-blue-600">
                      {Math.round(result.wpm)}
                    </span>
                  </p>
                )}
                {result.errors !== undefined && (
                  <p className="text-sm text-gray-600">
                    Erros:{' '}
                    <span className="font-bold text-red-600">
                      {result.errors}
                    </span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-4 w-full">
          <button
            onClick={() => navigate('/lobby')}
            className="px-6 py-3 text-lg font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg hover:from-purple-600 hover:to-indigo-600 transform hover:scale-105 transition-all shadow-lg"
          >
            Voltar para o Lobby
          </button>
        </div>
      </motion.div>
    </div>
  );
}