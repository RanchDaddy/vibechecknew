import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface QuizQuestionProps {
  question: string;
  options: Array<string | { image: string; text: string }>;
  selectedAnswer: string | null;
  isWaiting: boolean;
  onAnswerSelect: (answer: string) => void;
  type?: "text" | "image";
}

export const QuizQuestion = ({
  question,
  options,
  selectedAnswer,
  isWaiting,
  onAnswerSelect,
  type = "text"
}: QuizQuestionProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl mb-6">{question}</h3>
      
      <div className={`space-y-4 ${type === "image" ? "grid grid-cols-2 gap-4" : ""}`}>
        {options.map((option, index) => {
          const optionText = typeof option === "string" ? option : option.text;
          const optionValue = typeof option === "string" ? option : option.text;
          
          return (
            <Button
              key={index}
              onClick={() => onAnswerSelect(optionValue)}
              disabled={isWaiting || selectedAnswer !== null}
              className={`w-full justify-start text-left ${
                selectedAnswer === optionValue ? 'bg-primary text-white' : 'bg-secondary'
              } ${type === "image" ? "h-auto flex-col items-center p-4" : ""}`}
            >
              {type === "image" && typeof option !== "string" && (
                <img 
                  src={option.image} 
                  alt={option.text}
                  className="w-full h-32 object-cover mb-2 rounded"
                />
              )}
              {optionText}
            </Button>
          );
        })}
      </div>

      {isWaiting && (
        <p className="text-center mt-6 text-gray-600 animate-pulse">
          Waiting for partner's answer...
        </p>
      )}
    </Card>
  );
};