import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface QuizQuestionProps {
  question: string;
  options: string[];
  selectedAnswer: string | null;
  isWaiting: boolean;
  onAnswerSelect: (answer: string) => void;
}

export const QuizQuestion = ({
  question,
  options,
  selectedAnswer,
  isWaiting,
  onAnswerSelect,
}: QuizQuestionProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl mb-6">{question}</h3>
      
      <div className="space-y-4">
        {options.map((option, index) => (
          <Button
            key={index}
            onClick={() => onAnswerSelect(option)}
            disabled={isWaiting || selectedAnswer !== null}
            className={`w-full justify-start text-left ${
              selectedAnswer === option ? 'bg-primary text-white' : 'bg-secondary'
            }`}
          >
            {option}
          </Button>
        ))}
      </div>

      {isWaiting && (
        <p className="text-center mt-6 text-gray-600 animate-pulse">
          Waiting for partner's answer...
        </p>
      )}
    </Card>
  );
};