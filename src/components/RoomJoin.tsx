import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from 'qrcode.react';

interface RoomJoinProps {
  onJoinRoom: (code: string) => void;
}

export const RoomJoin = ({ onJoinRoom }: RoomJoinProps) => {
  const [roomCode, setRoomCode] = useState('');
  const currentUrl = window.location.href;

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
          onClick={() => onJoinRoom(roomCode)}
        >
          Join Room
        </Button>
      </div>
    </div>
  );
};