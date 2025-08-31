import OpenAI from 'openai';
process.env.OPENAI_API_KEY = process.env.DEEPSEEK_API_KEY ?? '';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

export async function generateQuestionWithDeepSeek() {
  const response = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: 'Generate a random IELTS Speaking question (Part 1, 2, or 3). 30% chance to include an image description for the user to describe.' },
      { role: 'user', content: 'Generate one question.' },
    ],
  });
  const content = response.choices[0].message.content ?? '';
  // Parse content to extract text and optional imagePrompt
  const imagePromptMatch = content.match(/Image: (.*)/);
  const text = imagePromptMatch ? content.split('Image:')[0].trim() : content;
  const imagePrompt = imagePromptMatch ? imagePromptMatch[1]?.trim() : null;
  return { text, imagePrompt };
}

export async function scoreWithDeepSeek(transcript: string, question: string, previousTranscript?: string) {
  let prompt = `Evaluate this IELTS Speaking response based on criteria: Fluency (0-9), Grammar (0-9), Vocabulary (0-9), Pronunciation (0-9). Provide overall score (0-9). Question: ${question}. Response: ${transcript}.`;
  if (previousTranscript) {
    prompt += ` Previous response: ${previousTranscript}. Also provide improvement notes.`;
  }
  const response = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: 'You are an IELTS examiner. Use official band descriptors for scoring.' },
      { role: 'user', content: prompt },
    ],
  });
  const content = response.choices[0].message.content ?? '';
  // Parse scores from content (assume formatted like Fluency: 7, etc.)
  const fluencyMatch = content.match(/Fluency: (\d)/);
  const fluency = fluencyMatch ? parseInt(fluencyMatch[1]) : 0;
  const grammarMatch = content.match(/Grammar: (\d)/);
  const grammar = grammarMatch ? parseInt(grammarMatch[1]) : 0;
  const vocabularyMatch = content.match(/Vocabulary: (\d)/);
  const vocabulary = vocabularyMatch ? parseInt(vocabularyMatch[1]) : 0;
  const pronunciationMatch = content.match(/Pronunciation: (\d)/);
  const pronunciation = pronunciationMatch ? parseInt(pronunciationMatch[1]) : 0;
  const overall = (fluency + grammar + vocabulary + pronunciation) / 4;
  const improvementMatch = content.match(/Improvement: (.*)/);
  const improvement = improvementMatch ? improvementMatch[1] : null;
  return { fluency, grammar, vocabulary, pronunciation, overall, improvement };
}