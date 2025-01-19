import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import confetti from 'canvas-confetti';
import { Skeleton } from "@/components/ui/skeleton";

interface ResultsProps {
  score: number;
  onRestart: () => void;
}

export const Results = ({ score, onRestart }: ResultsProps) => {
  const [showHeart, setShowHeart] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    // Start the analysis animation
    const analyzeTimer = setTimeout(() => {
      setIsAnalyzing(false);
      setShowScore(true);
      // Show heart and trigger confetti after score appears
      setTimeout(() => {
        setShowHeart(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 500);
    }, 3000); // Analysis takes 3 seconds

    return () => clearTimeout(analyzeTimer);
  }, []);

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
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className={`transition-all duration-1000 ${showHeart ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
        <div className="text-9xl animate-bounce">❤️</div>
      </div>
      
      <div className={`text-center space-y-4 ${showScore ? 'animate-fade-in' : 'opacity-0'}`}>
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