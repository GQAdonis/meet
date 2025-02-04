import { NextRequest, NextResponse } from 'next/server';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

if (!API_KEY || !API_SECRET || !LIVEKIT_URL) {
  throw new Error('Missing required LiveKit environment variables');
}

export async function POST(request: NextRequest) {
  try {
    const { roomName, e2ee, sharedPassphrase } = await request.json();

    if (!roomName || typeof roomName !== 'string') {
      return NextResponse.json(
        { error: 'Room name is required and must be a string' },
        { status: 400 }
      );
    }

    if (e2ee && (typeof e2ee !== 'boolean' || !sharedPassphrase || typeof sharedPassphrase !== 'string')) {
      return NextResponse.json(
        { error: 'E2EE and shared passphrase are required and must be a boolean and string respectively' },
        { status: 400 }
      );
    }

    // Create LiveKit room service client
    const roomService = new RoomServiceClient(
      LIVEKIT_URL!,
      API_KEY,
      API_SECRET
    );

    // Create room with specified options
    const room = await roomService.createRoom({
      name: roomName,
      emptyTimeout: 10 * 60, // 10 minutes
      maxParticipants: 20,
      metadata: e2ee ? JSON.stringify({ e2ee: true, passphrase: sharedPassphrase }) : undefined,
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Failed to create room',
      { status: 500 }
    );
  }
}
