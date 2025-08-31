import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_TOKEN);

export async function generateImage(prompt: string): Promise<Buffer> {
  const result = await hf.textToImage({
    model: 'stabilityai/stable-diffusion-2',
    inputs: prompt,
  });

  // Case 1: already a Buffer (Node.js environment)
  if (Buffer.isBuffer(result)) {
    return result;
  }

  throw new Error(`Unexpected result type from textToImage: ${Object.prototype.toString.call(result)}`);
}
