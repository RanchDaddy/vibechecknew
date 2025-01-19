import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import confetti from 'canvas-confetti';
import { Skeleton } from "@/components/ui/skeleton";

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

  const handleRoomUpdate = (room: any) => {
    console.log('Processing room update:', room);
    if (room.player1_answer !== null && room.player2_answer !== null) {
      console.log('Both answers present:', room.player1_answer, room.player2_answer);
      setPlayer1Answer(Number(room.player1_answer));
      setPlayer2Answer(Number(room.player2_answer));
      const calculatedScore = calculateScore(
        Number(room.player1_answer),
        Number(room.player2_answer)
      );
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
    console.log('Setting up subscription for room:', roomCode);
    
    // Check initial state immediately
    const checkInitialState = async () => {
      try {
        const { data: room, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('code', roomCode)
          .single();

        if (error) {
          console.error('Error fetching initial room state:', error);
          return;
        }

        console.log('Initial room state:', room);
        if (room) {
          handleRoomUpdate(room);
        }
      } catch (error) {
        console.error('Error in checkInitialState:', error);
      }
    };

    checkInitialState();

    // Set up realtime subscription
    const channel = supabase.channel(`room_${roomCode}`);
    
    channel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `code=eq.${roomCode}`,
      }, (payload) => {
        console.log('Received realtime update:', payload);
        if (payload.new) {
          handleRoomUpdate(payload.new);
        }
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Poll for updates as a backup mechanism
    const pollInterval = setInterval(async () => {
      const { data: room } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode)
        .single();
      
      if (room) {
        handleRoomUpdate(room);
      }
    }, 2000); // Poll every 2 seconds

    return () => {
      console.log('Cleaning up subscription');
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