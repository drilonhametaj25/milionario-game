import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToastProvider } from './components/ui/Toast';
import { Home, CreateRoom, JoinRoom, Lobby, Game, Voting, Validation, Reveal, StorySelect } from './pages';

function App() {
  const [playerId, setPlayerId] = useState(() =>
    localStorage.getItem('playerId') || null
  );
  const [roomCode, setRoomCode] = useState(() =>
    localStorage.getItem('roomCode') || null
  );

  useEffect(() => {
    if (playerId) {
      localStorage.setItem('playerId', playerId);
    } else {
      localStorage.removeItem('playerId');
    }
  }, [playerId]);

  useEffect(() => {
    if (roomCode) {
      localStorage.setItem('roomCode', roomCode);
    } else {
      localStorage.removeItem('roomCode');
    }
  }, [roomCode]);

  const clearSession = () => {
    setPlayerId(null);
    setRoomCode(null);
    localStorage.removeItem('playerId');
    localStorage.removeItem('roomCode');
  };

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                playerId={playerId}
                roomCode={roomCode}
                clearSession={clearSession}
                setPlayerId={setPlayerId}
                setRoomCode={setRoomCode}
              />
            }
          />
          <Route
            path="/stories"
            element={<StorySelect />}
          />
          <Route
            path="/create"
            element={
              <CreateRoom
                setPlayerId={setPlayerId}
                setRoomCode={setRoomCode}
              />
            }
          />
          <Route
            path="/join"
            element={
              <JoinRoom
                setPlayerId={setPlayerId}
                setRoomCode={setRoomCode}
              />
            }
          />
          <Route
            path="/join/:code"
            element={
              <JoinRoom
                setPlayerId={setPlayerId}
                setRoomCode={setRoomCode}
              />
            }
          />
          <Route
            path="/lobby/:code"
            element={
              <Lobby
                playerId={playerId}
                clearSession={clearSession}
              />
            }
          />
          <Route
            path="/game/:code"
            element={
              <Game
                playerId={playerId}
              />
            }
          />
          <Route
            path="/voting/:code"
            element={
              <Voting
                playerId={playerId}
              />
            }
          />
          <Route
            path="/validation/:code"
            element={
              <Validation
                playerId={playerId}
              />
            }
          />
          <Route
            path="/reveal/:code"
            element={
              <Reveal
                playerId={playerId}
                clearSession={clearSession}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
