import React from 'react';

interface QuizProgressProps {
  currentQuestion: number;
  roomCode: string;
}

export const QuizProgress = ({ currentQuestion, roomCode }: QuizProgressProps) => {
  return (
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-primary mb-2">Question {currentQuestion + 1}</h2>
      <p className="text-gray-600">Room Code: {roomCode}</p>
    </div>
  );
};