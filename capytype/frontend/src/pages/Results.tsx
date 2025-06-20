import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { motion } from 'framer-motion';

export default function Results() {
  const navigate = useNavigate();
  const { gameResults } = useGameStore();

  useEffect(() => {
    // If there are no results, redirect back to lobby
    if (!gameResults || gameResults.length === 0) {
      navigate('/lobby');
    }
  }, [gameResults, navigate]);

  const sortedResults = [...(gameResults || [])].sort((a, b) => a.position - b.position);

  const getPositionSuffix = (position: number) => {
    if (position === 1) return 'st';
    if (position === 2) return 'nd';
    if (position === 3) return 'rd';
    return 'th';
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'from-yellow-400 to-yellow-500'; // Gold
      case 2:
        return 'from-gray-300 to-gray-400'; // Silver
      case 3:
        return 'from-amber-600 to-amber-700'; // Bronze
      default:
        return 'from-purple-500 to-indigo-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-indigo-600 mb-4">Race Results 🏁</h1>
          <p className="text-gray-600">Great race, everyone! Here's how you did:</p>
        </motion.div>

        <div className="space-y-4">
          {sortedResults.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${getPositionColor(result.position)} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600">
                      {result.position}
                    </div>
                    <div className="text-white">
                      <h3 className="text-xl font-bold">{result.nickname}</h3>
                      <p className="text-white opacity-90">
                        {result.position}
                        {getPositionSuffix(result.position)} Place
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-white">
                    <p className="text-2xl font-bold">{result.wpm} WPM</p>
                    <p className="opacity-90">Speed</p>
                  </div>
                </div>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4 bg-gradient-to-b from-white to-indigo-50">
                <div className="text-center">
                  <p className="text-gray-500">Time</p>
                  <p className="text-xl font-bold text-indigo-600">
                    {result.time.toFixed(1)}s
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Errors</p>
                  <p className="text-xl font-bold text-red-500">{result.errors}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => navigate('/lobby')}
            className="px-8 py-4 text-xl font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg hover:from-purple-600 hover:to-indigo-600 transform hover:scale-105 transition-all shadow-lg"
          >
            Back to Lobby
          </button>
        </motion.div>
      </div>
    </div>
  );
} 