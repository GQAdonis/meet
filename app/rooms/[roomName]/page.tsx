import * as React from 'react';
import { PageClientImpl } from './PageClientImpl';
import { isVideoCodec } from '@/lib/types';

interface SearchParams {
  region?: string;
  hq?: string;
  codec?: string;
}

interface Params {
  roomName: string;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  // Await the params and searchParams
  const { roomName } = await params;
  const { codec: rawCodec, hq: rawHq, region } = await searchParams;

  const codec = typeof rawCodec === 'string' && isVideoCodec(rawCodec) ? rawCodec : 'vp9';
  const hq = rawHq === 'true' ? true : false;

  return (
    <PageClientImpl roomName={roomName} region={region} hq={hq} codec={codec} />
  );
}
