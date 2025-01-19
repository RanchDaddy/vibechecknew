import { useState } from 'react';
import { RoomJoin } from '@/components/RoomJoin';
import { SyncScreen } from '@/components/SyncScreen';
import { SliderGame } from '@/components/SliderGame';
import { SliderResults } from '@/components/SliderResults';

const Index = () => {
  const [stage, setStage] = useState<'join' | 'sync' | 'game' | 'results'>('join');
  const [roomCode, setRoomCode] = useState('');
  const [score, setScore] = useState(0);

  const handleJoinRoom = (code: string) => {
    setRoomCode(code);
    setStage('sync');
  };

  const handleSynced = () => {
    setStage('game');
  };

  const handleGameComplete = (finalScore: number) => {
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
      {stage === 'sync' && <SyncScreen roomCode={roomCode} onSynced={handleSynced} />}
      {stage === 'game' && <SliderGame roomCode={roomCode} onComplete={handleGameComplete} />}
      {stage === 'results' && (
        <SliderResults 
          score={score} 
          roomCode={roomCode}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};

export default Index;