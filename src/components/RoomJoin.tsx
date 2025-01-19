import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RoomJoinProps {
  onJoinRoom: (code: string) => void;
}

export const RoomJoin = ({ onJoinRoom }: RoomJoinProps) => {
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const currentUrl = window.location.href;
  const { toast } = useToast();

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a room code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // First check if room exists
      const { data: existingRoom } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode)
        .single();

      if (existingRoom) {
        // Room exists, try to join as player 2 if spot is available
        if (!existingRoom.player2_id) {
          const { error: updateError } = await supabase
            .from('rooms')
            .update({ player2_id: crypto.randomUUID() })
            .eq('code', roomCode);

          if (updateError) throw updateError;
        } else if (!existingRoom.player1_id) {
          // In case player2 somehow got set but player1 didn't
          const { error: updateError } = await supabase
            .from('rooms')
            .update({ player1_id: crypto.randomUUID() })
            .eq('code', roomCode);

          if (updateError) throw updateError;
        } else {
          throw new Error('Room is full');
        }
      } else {
        // Create new room as player 1
        const { error: createError } = await supabase
          .from('rooms')
          .insert([
            {
              code: roomCode,
              player1_id: crypto.randomUUID(),
              current_question: 0,
              status: 'waiting'
            }
          ]);

        if (createError) throw createError;
      }

      onJoinRoom(roomCode);
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join room",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8 p-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary">Compatibility Test</h1>
        <p className="text-lg text-gray-600">
          Have your partner scan the QR code and type in the same room code to begin
        </p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <QRCodeSVG value={currentUrl} size={200} />
      </div>

      <div className="w-full max-w-xs space-y-4">
        <Input
          type="text"
          placeholder="Enter room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className="text-center text-xl"
        />
        <Button 
          className="w-full bg-primary hover:bg-primary/90"
          onClick={handleJoinRoom}
          disabled={isLoading}
        >
          {isLoading ? "Joining..." : "Join Room"}
        </Button>
      </div>
    </div>
  );
};