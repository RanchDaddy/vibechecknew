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

  useEffect(() => {
    const fetchAnswers = async () => {
      const { data: room } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode)
        .single();

      if (room) {
        setPlayer1Answer(Number(room.player1_answer));
        setPlayer2Answer(Number(room.player2_answer));
      }
    };

    fetchAnswers();

    // Start the analysis animation
    const analyzeTimer = setTimeout(() => {
      setIsAnalyzing(false);
      setShowScore(true);
      // Trigger confetti after score appears
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 500);
    }, 3000);

    return () => clearTimeout(analyzeTimer);
  }, [roomCode]);

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-primary animate-pulse">
            Analyzing Compatibility
          </h2>
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
            <Skeleton className="h-4 w-52 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 p-8">
      <div className={`text-center space-y-4 ${showScore ? 'animate-fade-in' : 'opacity-0'}`}>
        <h2 className="text-3xl font-bold text-primary">Compatibility Score</h2>
        <p className="text-6xl font-bold animate-score-reveal">{score}%</p>
        
        <div className="max-w-md w-full mx-auto mt-8 space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Player 1's Answer</p>
            <Slider
              disabled
              value={player1Answer ? [player1Answer] : [0]}
              max={100}
              step={1}
              className="mb-4"
            />
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Player 2's Answer</p>
            <Slider
              disabled
              value={player2Answer ? [player2Answer] : [0]}
              max={100}
              step={1}
              className="mb-4"
            />
          </div>
        </div>
      </div>

      <Button 
        onClick={onRestart}
        className="mt-8 bg-primary hover:bg-primary/90"
      >
        Try Again
      </Button>
    </div>
  );
};