import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import Login from './pages/Login';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import Results from './pages/Results';

function App() {
  const connect = useGameStore((state) => state.connect);

  useEffect(() => {
    try {
      console.log('Attempting to connect to socket...');
      connect();
    } catch (error) {
      console.error('Failed to connect to socket:', error);
    }
  }, [connect]);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center text-indigo-600 mb-8">
            CapyType Race
          </h1>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/game" element={<Game />} />
            <Route path="/results" element={<Results />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
