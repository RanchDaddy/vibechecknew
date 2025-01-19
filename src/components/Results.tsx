import { Button } from "@/components/ui/button";
import confetti from 'canvas-confetti';

interface ResultsProps {
  score: number;
  onRestart: () => void;
}

export const Results = ({ score, onRestart }: ResultsProps) => {
  const getMessage = (score: number) => {
    if (score >= 80) return "Incredible Match! You two are practically telepathic! 🌟";
    if (score >= 60) return "Great Connection! You're definitely on the same wavelength! 💫";
    if (score >= 40) return "Nice Sync! You've got a fun dynamic going! ✨";
    return "Uniquely Different! Opposites attract, right? 🌈";
  };

  // Trigger confetti animation
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="flex flex-col items-center space-y-8 p-8 text-center">
      <h2 className="text-4xl font-bold text-primary animate-score-reveal">
        {score}% Compatible
      </h2>
      <p className="text-xl text-gray-600">{getMessage(score)}</p>
      <Button 
        onClick={() => {
          triggerConfetti();
          onRestart();
        }}
        className="bg-primary hover:bg-primary/90"
      >
        Try Again
      </Button>
    </div>
  );
};