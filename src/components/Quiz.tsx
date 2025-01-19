import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { questions } from "@/lib/questions";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { SyncScreen } from './SyncScreen';

interface QuizProps {
  roomCode: string;
  onComplete: (score: number) => void;
}

type Room = Database['public']['Tables']['rooms']['Row'];

export const Quiz = ({ roomCode, onComplete }: QuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isSynced) return;

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
        (payload: RealtimePostgresChangesPayload<Room>) => {
          if (
            payload.new && 
            typeof payload.new.player1_answer === 'string' && 
            typeof payload.new.player2_answer === 'string'
          ) {
            setIsWaiting(false);
            if (currentQuestion < questions.length - 1) {
              setCurrentQuestion(prev => prev + 1);
              setSelectedAnswer(null);
            } else {
              const score = Math.floor(Math.random() * 41) + 60;
              onComplete(score);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode, currentQuestion, onComplete, isSynced]);

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    setIsWaiting(true);

    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          current_question: currentQuestion,
          [`player${Math.random() < 0.5 ? '1' : '2'}_answer`]: answer
        })
        .eq('code', roomCode);

      if (error) throw error;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive"
      });
      setIsWaiting(false);
    }
  };

  if (!isSynced) {
    return <SyncScreen roomCode={roomCode} onSynced={() => setIsSynced(true)} />;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">Question {currentQuestion + 1}</h2>
        <p className="text-gray-600">Room Code: {roomCode}</p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl mb-6">{questions[currentQuestion].question}</h3>
        
        <div className="space-y-4">
          {questions[currentQuestion].options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswer(option)}
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
    </div>
  );
};