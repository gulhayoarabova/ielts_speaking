import speech from '@google-cloud/speech';

const client = new speech.SpeechClient();

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  const config = {
    encoding: 'MP3' as const, // Assume MP3, adjust if needed
    sampleRateHertz: 16000,
    languageCode: 'en-US',
  };
  const audio = { content: audioBuffer.toString('base64') };
  const [response] = await client.recognize({ config, audio });
  return (response.results ?? []).map(result => (result.alternatives ?? [])[0]?.transcript ?? '').join('\n');
}