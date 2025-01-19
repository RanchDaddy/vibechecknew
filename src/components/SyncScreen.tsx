import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Database } from '@/integrations/supabase/types';
import { Heart } from 'lucide-react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type Room = Database['public']['Tables']['rooms']['Row'];

interface SyncScreenProps {
  roomCode: string;
  onSynced: () => void;
}

export const SyncScreen = ({ roomCode, onSynced }: SyncScreenProps) => {
  const [isSynced, setIsSynced] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // First check if room is already synced
    const checkInitialState = async () => {
      const { data: room } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode)
        .single();

      if (room && room.player1_id && room.player2_id) {
        setIsSynced(true);
        setTimeout(() => setShowButton(true), 2000);
      }
    };

    checkInitialState();

    const channel = supabase
      .channel('room_sync')
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
          if (newRoom && newRoom.player1_id && newRoom.player2_id) {
            setIsSynced(true);
            setTimeout(() => setShowButton(true), 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-primary">
          {isSynced ? "Ready to begin!" : "Waiting for partner..."}
        </h2>
        <p className="text-gray-600">
          {isSynced 
            ? "Both players are connected" 
            : "Please wait while your partner joins the room"}
        </p>
      </div>

      <div className={`transition-all duration-1000 ${isSynced ? 'scale-110' : 'scale-90'}`}>
        <Heart
          className={`w-24 h-24 ${
            isSynced 
              ? 'text-primary animate-pulse' 
              : 'text-gray-300'
          }`}
          fill={isSynced ? 'currentColor' : 'none'}
        />
      </div>

      {showButton && (
        <Button
          onClick={onSynced}
          className="bg-primary hover:bg-primary/90 animate-fade-in"
        >
          Begin Quiz
        </Button>
      )}
    </div>
  );
};