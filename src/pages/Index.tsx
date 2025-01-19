import { useState } from 'react';
import { RoomJoin } from '@/components/RoomJoin';
import { Quiz } from '@/components/Quiz';
import { Results } from '@/components/Results';

const Index = () => {
  const [stage, setStage] = useState<'join' | 'quiz' | 'results'>('join');
  const [roomCode, setRoomCode] = useState('');
  const [score, setScore] = useState(0);

  const handleJoinRoom = (code: string) => {
    setRoomCode(code);
    setStage('quiz');
  };

  const handleQuizComplete = (finalScore: number) => {
    setScore(finalScore);
    setStage('results');
  };

  const handleRestart = () => {
    setStage('join');
    setRoomCode('');
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-background">
      {stage === 'join' && <RoomJoin onJoinRoom={handleJoinRoom} />}
      {stage === 'quiz' && <Quiz roomCode={roomCode} onComplete={handleQuizComplete} />}
      {stage === 'results' && <Results score={score} onRestart={handleRestart} />}
    </div>
  );
};

export default Index;