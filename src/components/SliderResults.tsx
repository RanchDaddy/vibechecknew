import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import confetti from 'canvas-confetti';
import { Skeleton } from "@/components/ui/skeleton";
import { Database } from '@/integrations/supabase/types';

type Room = Database['public']['Tables']['rooms']['Row'];

interface SliderResultsProps {
  score: number;
  roomCode: string;
  onRestart: () => void;
}

export const SliderResults = ({ score, roomCode, onRestart }: SliderResultsProps) => {
  const [player1Answer, setPlayer1Answer] = useState<number | null>(null);
  const [player2Answer, setPlayer2Answer] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [showScore, setShowScore] = useState(false);
  const [finalScore, setFinalScore] = useState(score);

  const calculateScore = (answer1: number, answer2: number) => {
    const difference = Math.abs(answer1 - answer2);
    const maxDifference = 100;
    return Math.round(100 * (1 - difference / maxDifference));
  };

  const handleRoomUpdate = (room: Room | null) => {
    if (!room) return;
    
    console.log('Processing room update:', room);
    
    if (room.player1_answer !== null && room.player2_answer !== null) {
      const p1Answer = Number(room.player1_answer);
      const p2Answer = Number(room.player2_answer);
      
      setPlayer1Answer(p1Answer);
      setPlayer2Answer(p2Answer);
      
      const calculatedScore = calculateScore(p1Answer, p2Answer);
      setFinalScore(calculatedScore);
      setIsAnalyzing(false);
      setShowScore(true);
      
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 500);
    }
  };

  useEffect(() => {
    console.log('Setting up room monitoring for:', roomCode);
    
    const checkRoomState = async () => {
      const { data: room } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode)
        .single();

      console.log('Current room state:', room);
      handleRoomUpdate(room);
    };

    // Check initial state
    checkRoomState();

    // Set up subscription
    const channel = supabase
      .channel('room_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `code=eq.${roomCode}`,
        },
        (payload) => {
          console.log('Received room update:', payload);
          if (payload.new && typeof payload.new === 'object') {
            handleRoomUpdate(payload.new as Room);
          }
        }
      )
      .subscribe();

    // Poll as backup
    const pollInterval = setInterval(checkRoomState, 2000);

    return () => {
      channel.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [roomCode]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 p-8">
      <div className={`text-center space-y-4 ${showScore ? 'animate-fade-in' : 'opacity-0'}`}>
        <h2 className="text-3xl font-bold text-primary">Compatibility Score</h2>
        <p className="text-6xl font-bold animate-score-reveal">{finalScore}%</p>
        
        <div className="max-w-md w-full mx-auto mt-8 space-y-6">
          {player1Answer !== null && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Player 1's Answer</p>
              <Slider
                disabled
                value={[player1Answer]}
                max={100}
                step={1}
                className="mb-4"
              />
            </div>
          )}
          
          {player2Answer !== null && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Player 2's Answer</p>
              <Slider
                disabled
                value={[player2Answer]}
                max={100}
                step={1}
                className="mb-4"
              />
            </div>
          )}
        </div>
      </div>

      {isAnalyzing && (
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-primary animate-pulse">
            Waiting for other player...
          </h2>
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
            <Skeleton className="h-4 w-52 mx-auto" />
          </div>
        </div>
      )}

      <Button 
        onClick={onRestart}
        className="mt-8 bg-primary hover:bg-primary/90"
      >
        Try Again
      </Button>
    </div>
  );
};