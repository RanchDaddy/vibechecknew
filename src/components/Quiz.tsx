import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { questions } from '@/lib/questions';

interface QuizProps {
  roomCode: string;
  onComplete: (score: number) => void;
}

export const Quiz = ({ roomCode, onComplete }: QuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    if (newAnswers.length === questions.length) {
      // Calculate score (placeholder - implement actual scoring logic)
      const score = Math.floor(Math.random() * 100);
      onComplete(score);
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const question = questions[currentQuestion];

  return (
    <div className="flex flex-col items-center space-y-8 p-8">
      <div className="text-center">
        <p className="text-sm text-gray-500">Question {currentQuestion + 1} of {questions.length}</p>
        <h2 className="text-2xl font-bold mt-2">{question.text}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
        {question.options.map((option, index) => (
          <Card 
            key={index}
            className="p-4 cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleAnswer(option.value)}
          >
            {option.image && (
              <img 
                src={option.image} 
                alt={option.value}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
            )}
            {option.color && (
              <div 
                className="w-full h-40 rounded-lg mb-4"
                style={{ backgroundColor: option.color }}
              />
            )}
            {option.emoji && (
              <div className="text-4xl text-center mb-4">
                {option.emoji}
              </div>
            )}
            <p className="text-center">{option.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};