import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { Database } from '@/integrations/supabase/types';

type Room = Database['public']['Tables']['rooms']['Row'];

interface SliderGameProps {
  roomCode: string;
  onComplete: (score: number) => void;
}

export const SliderGame = ({ roomCode, onComplete }: SliderGameProps) => {
  const [sliderValue, setSliderValue] = useState([50]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [bothSubmitted, setBothSubmitted] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('slider_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `code=eq.${roomCode}`,
        },
        (payload) => {
          const updatedRoom = payload.new as Room;
          if (updatedRoom.player1_answer !== null && updatedRoom.player2_answer !== null) {
            const score = calculateScore(
              Number(updatedRoom.player1_answer), 
              Number(updatedRoom.player2_answer)
            );
            setBothSubmitted(true);
            setTimeout(() => onComplete(score), 1000);
          }
        }
      )
      .subscribe();

    // Check initial state in case both answers are already submitted
    const checkInitialState = async () => {
      const { data: room } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode)
        .single();

      if (room && room.player1_answer !== null && room.player2_answer !== null) {
        const score = calculateScore(
          Number(room.player1_answer),
          Number(room.player2_answer)
        );
        setBothSubmitted(true);
        setTimeout(() => onComplete(score), 1000);
      }
    };

    checkInitialState();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode, onComplete]);

  const calculateScore = (answer1: number, answer2: number) => {
    const difference = Math.abs(answer1 - answer2);
    const maxDifference = 100;
    return Math.round(100 * (1 - difference / maxDifference));
  };

  const handleSubmit = async () => {
    try {
      const { data: room } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode)
        .single();

      if (!room) return;

      const isPlayer1 = room.player1_id === (await supabase.auth.getUser()).data.user?.id;
      const updateField = isPlayer1 ? 'player1_answer' : 'player2_answer';

      await supabase
        .from('rooms')
        .update({ [updateField]: sliderValue[0] })
        .eq('code', roomCode);

      setHasSubmitted(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 p-8">
      <h2 className="text-4xl font-bold text-primary mb-8">Elon Musk</h2>
      
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Evil</span>
          <span>Good</span>
        </div>
        
        <Slider
          disabled={hasSubmitted}
          value={sliderValue}
          onValueChange={setSliderValue}
          max={100}
          step={1}
          className="mb-8"
        />

        {!hasSubmitted ? (
          <Button 
            onClick={handleSubmit}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Submit
          </Button>
        ) : (
          <p className="text-center text-gray-600">
            {bothSubmitted ? "Calculating results..." : "Waiting for other player..."}
          </p>
        )}
      </div>
    </div>
  );
};