import { videoCodecs } from 'livekit-client';
import { VideoConferenceClientImpl } from './VideoConferenceClientImpl';
import { isVideoCodec } from '@/lib/types';

interface SearchParams {
  liveKitUrl?: string;
  token?: string;
  codec?: string;
}

export default async function CustomRoomConnection({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { liveKitUrl, token, codec } = await searchParams;
  
  if (typeof liveKitUrl !== 'string') {
    return <h2>Missing LiveKit URL</h2>;
  }
  if (typeof token !== 'string') {
    return <h2>Missing LiveKit token</h2>;
  }
  if (codec !== undefined && !isVideoCodec(codec)) {
    return <h2>Invalid codec, if defined it has to be [{videoCodecs.join(', ')}].</h2>;
  }

  return (
    <main data-lk-theme="default" style={{ height: '100%' }}>
      <VideoConferenceClientImpl liveKitUrl={liveKitUrl} token={token} codec={codec} />
    </main>
  );
}
