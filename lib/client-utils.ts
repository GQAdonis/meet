export function encodePassphrase(passphrase: string) {
  return encodeURIComponent(passphrase);
}

export function decodePassphrase(base64String: string) {
  return decodeURIComponent(base64String);
}

export function generateRoomId(): string {
  return `${randomString(4)}-${randomString(4)}`;
}

const adjectives = [
  'swift', 'bright', 'cosmic', 'digital', 'elegant',
  'fluent', 'golden', 'happy', 'infinite', 'joyful',
  'kind', 'logical', 'magical', 'noble', 'optimal',
  'peaceful', 'quick', 'radiant', 'silent', 'thoughtful'
];

const nouns = [
  'aurora', 'breeze', 'crystal', 'dawn', 'echo',
  'flame', 'garden', 'harbor', 'island', 'journey',
  'lake', 'meadow', 'nebula', 'ocean', 'path',
  'quest', 'river', 'summit', 'valley', 'wave'
];

export function generateRoomName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective}-${noun}-${randomString(4)}`;
}

export function randomString(length: number): string {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
