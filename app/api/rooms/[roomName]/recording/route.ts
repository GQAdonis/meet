import { NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'
import type { NextRequest } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { roomName: string } }
) {
  try {
    const { roomName } = params
    const { action } = await request.json()
    const userId = request.headers.get('X-User-Id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is room creator
    const isCreator = userId === roomName.split('-')[0]
    if (!isCreator) {
      return NextResponse.json({ error: 'Not room creator' }, { status: 403 })
    }

    const apiKey = process.env.LIVEKIT_RECORDING_API_KEY
    const apiSecret = process.env.LIVEKIT_RECORDING_API_SECRET

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Recording not configured' },
        { status: 500 }
      )
    }

    const url = `https://your-livekit-server/recording/${action}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}:${apiSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomName,
        // Add any additional recording options here
      }),
    })

    if (!response.ok) {
      throw new Error(`Recording ${action} failed`)
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Error with recording:', e)
    return NextResponse.json(
      { error: 'Recording operation failed' },
      { status: 500 }
    )
  }
}
