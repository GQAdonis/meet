import { NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'
import type { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { roomName: string } }
) {
  try {
    const { roomName } = params
    const userId = request.headers.get('X-User-Id')

    if (!userId) {
      return NextResponse.json({ isCreator: false }, { status: 401 })
    }

    // In a real implementation, you would check your database
    // to see if this user created this room
    const isCreator = userId === roomName.split('-')[0]

    return NextResponse.json({ isCreator })
  } catch (e) {
    console.error('Error checking room creator:', e)
    return NextResponse.json({ isCreator: false }, { status: 500 })
  }
}
