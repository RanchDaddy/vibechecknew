import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { questions } from "@/lib/questions";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { SyncScreen } from './SyncScreen';
import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';

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
  const [matchingAnswers, setMatchingAnswers] = useState(0);
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
          const newRoom = payload.new as Room;
          if (!newRoom) return;

          if (newRoom.player1_answer && newRoom.player2_answer) {
            // Check if answers match and update score
            if (newRoom.player1_answer === newRoom.player2_answer) {
              setMatchingAnswers(prev => prev + 1);
            }

            if (currentQuestion < questions.length - 1) {
              const updateRoom = async () => {
                const { error } = await supabase
                  .from('rooms')
                  .update({
                    current_question: currentQuestion + 1,
                    player1_answer: null,
                    player2_answer: null
                  })
                  .eq('code', roomCode);

                if (error) {
                  toast({
                    title: "Error",
                    description: "Failed to update room state",
                    variant: "destructive"
                  });
                }
              };
              updateRoom();
            } else {
              // Calculate final score based on matching answers
              const score = Math.round((matchingAnswers / questions.length) * 100);
              onComplete(score);
            }
          }

          // Update current question if it changed and is not null
          if (typeof newRoom.current_question === 'number' && newRoom.current_question !== currentQuestion) {
            setCurrentQuestion(newRoom.current_question);
            setSelectedAnswer(null);
            setIsWaiting(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode, currentQuestion, onComplete, isSynced, toast, matchingAnswers]);

  const handleAnswer = async (answer: string) => {
    if (isWaiting) return;
    
    setSelectedAnswer(answer);
    setIsWaiting(true);

    try {
      const { data: room } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode)
        .single();

      if (!room) throw new Error('Room not found');

      const isPlayer1 = !room.player1_answer;
      
      const { error } = await supabase
        .from('rooms')
        .update({
          [`player${isPlayer1 ? '1' : '2'}_answer`]: answer
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
      setSelectedAnswer(null);
    }
  };

  if (!isSynced) {
    return <SyncScreen roomCode={roomCode} onSynced={() => setIsSynced(true)} />;
  }

  const currentQuestionData = questions[currentQuestion];
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <QuizProgress 
        currentQuestion={currentQuestion}
        roomCode={roomCode}
      />
      
      <QuizQuestion
        question={currentQuestionData.question}
        options={currentQuestionData.options}
        selectedAnswer={selectedAnswer}
        isWaiting={isWaiting}
        onAnswerSelect={handleAnswer}
        type={currentQuestionData.type}
      />
    </div>
  );
};