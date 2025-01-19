import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import confetti from 'canvas-confetti';

interface ResultsProps {
  score: number;
  onRestart: () => void;
}

export const Results = ({ score, onRestart }: ResultsProps) => {
  const [showHeart, setShowHeart] = useState(false);

  useEffect(() => {
    // Trigger heart animation after a short delay
    setTimeout(() => {
      setShowHeart(true);
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 500);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className={`transition-all duration-1000 ${showHeart ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
        <div className="text-9xl animate-bounce">❤️</div>
      </div>
      
      <div className={`text-center space-y-4 animate-fade-in`}>
        <h2 className="text-3xl font-bold text-primary">Compatibility Score</h2>
        <p className="text-6xl font-bold animate-score-reveal">{score}%</p>
        <p className="text-xl text-gray-600">
          {score >= 80 ? "Perfect Match! 🎉" :
           score >= 60 ? "Great Connection! 💫" :
           score >= 40 ? "Room to Grow 🌱" :
           "Keep Exploring 🔍"}
        </p>
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