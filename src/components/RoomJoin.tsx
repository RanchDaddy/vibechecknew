import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RoomJoinProps {
  onJoinRoom: (code: string) => void;
}

export const RoomJoin = ({ onJoinRoom }: RoomJoinProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const { toast } = useToast();

  // Generate a random room code on component mount
  useEffect(() => {
    const generateRoomCode = () => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setRoomCode(code);
      createRoom(code);
    };

    generateRoomCode();
  }, []);

  const createRoom = async (code: string) => {
    try {
      const { error: createError } = await supabase
        .from('rooms')
        .insert([
          {
            code: code,
            player1_id: crypto.randomUUID(),
            current_question: 0,
            status: 'waiting'
          }
        ]);

      if (createError) throw createError;
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create room",
        variant: "destructive"
      });
    }
  };

  const handleJoinRoom = async (codeToJoin: string) => {
    if (!codeToJoin.trim()) {
      toast({
        title: "Error",
        description: "Invalid room code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: existingRoom, error: fetchError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', codeToJoin)
        .single();

      if (fetchError) throw new Error('Room not found');

      if (existingRoom) {
        if (!existingRoom.player2_id) {
          const { error: updateError } = await supabase
            .from('rooms')
            .update({ player2_id: crypto.randomUUID() })
            .eq('code', codeToJoin);

          if (updateError) throw updateError;
          onJoinRoom(codeToJoin);
        } else {
          throw new Error('Room is full');
        }
      }
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

  // Create the URL with the room code as a query parameter
  const qrUrl = new URL(window.location.href);
  qrUrl.searchParams.set('room', roomCode);

  // Check if we're joining via QR code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromQR = params.get('room');
    
    if (roomFromQR) {
      console.log('Joining room from QR code:', roomFromQR);
      handleJoinRoom(roomFromQR);
    }
  }, []);

  return (
    <div className="flex flex-col items-center space-y-8 p-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary">Compatibility Test</h1>
        <p className="text-lg text-gray-600">
          Have your partner scan the QR code to join the room
        </p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <QRCodeSVG value={qrUrl.toString()} size={200} />
      </div>

      <div className="text-center text-sm text-gray-500">
        Room Code: {roomCode}
      </div>
    </div>
  );
};