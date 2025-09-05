import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';

interface AiEvaluation {
  feedback: string;
  score: number | null;
  overall_band: number | null;
  strengths: string[];
  suggestions: string[];
}

interface AiResponse {
  transcript: string;
  evaluation: AiEvaluation;
  ai_response: string;
  ai_audio_base64: string | null;
  raw: any;
  original?: any;
  error?: string;
}


@Injectable()
export class SendToAiService {
  private readonly logger = new Logger(SendToAiService.name);
  private aiBaseUrl = process.env.AI_SERVICE_URL || 'https://ielts-speaking-9aqo.onrender.com';

  // Normalize helper
  private normalizeEvaluateResponse(data: any) {
    const normalized = {
      transcript: '',
      evaluation: {
        feedback: '',
        score: null as number | null,
        overall_band: null as number | null,
        strengths: [] as string[],
        suggestions: [] as string[],
      },
      ai_response: '',
      ai_audio_base64: null as string | null,
      raw: data,
    };

    try {
      if (data?.evaluation) {
        normalized.evaluation = {
          feedback: data.evaluation.detailed_feedback ?? data.evaluation.feedback ?? '',
          score: data.evaluation.score ?? data.evaluation.overall_band ?? null,
          overall_band: data.evaluation.overall_band ?? data.evaluation.score ?? null,
          strengths: data.evaluation.strengths ?? [],
          suggestions: data.evaluation.suggestions ?? [],
        };
      }
      if (data?.transcript) normalized.transcript = data.transcript;
      if (!normalized.evaluation.feedback && data?.feedback) normalized.evaluation.feedback = data.feedback;
      if (!normalized.evaluation.score && data?.score) normalized.evaluation.score = data.score;
      if (data?.response) normalized.ai_response = data.response;
      if (data?.ai_response) normalized.ai_response = data.ai_response;
      if (data?.audio || data?.audio_data) normalized.ai_audio_base64 = data.audio ?? data.audio_data;
    } catch (e: any) {
      this.logger.warn('Normalization partial failure: ' + e.message);
    }

    return normalized;
  }

  async sendChunkToAI(question: string, chunkBase64: string): Promise<AiResponse> {
    try {
      const audioBuffer = Buffer.from(chunkBase64, 'base64');

      const formData = new FormData();
      formData.append('questions', JSON.stringify([question]));
      formData.append('answers', JSON.stringify(['']));
      formData.append('audios', audioBuffer, {
        filename: 'chunk.wav',
        contentType: 'audio/wav',
      });

      const res = await axios.post(`${this.aiBaseUrl}/evaluate`, formData, {
        headers: formData.getHeaders(),
        timeout: 60000,
      });

      this.logger.debug('Raw /evaluate response: ' + JSON.stringify(res.data));
      const normalized = this.normalizeEvaluateResponse(res.data);
      return { ...normalized, original: res.data };
    } catch (e: any) {
      this.logger.error('sendChunkToAI error: ' + (e?.message ?? e));
      return {
        transcript: '',
        evaluation: {
          feedback: '',
          score: null,
          overall_band: null,
          strengths: [] as string[],
          suggestions: [] as string[]
        },
        ai_response: '',
        ai_audio_base64: null,
        raw: null,  // Added to satisfy the required 'raw' property
        original: null,
        error: e?.message ?? String(e)
      };
    }
  }

  async sendAudioToAI(filePath: string, question: string) {
    try {
      const fileBuffer = fs.readFileSync(filePath);

      const formData = new FormData();
      formData.append('questions', JSON.stringify([question]));
      formData.append('answers', JSON.stringify(['']));
      formData.append('audios', fileBuffer, {
        filename: 'audio.wav',
        contentType: 'audio/wav',
      });

      const res = await axios.post(`${this.aiBaseUrl}/evaluate`, formData, {
        headers: formData.getHeaders(),
        timeout: 60000,
      });

      this.logger.debug('Raw /evaluate response: ' + JSON.stringify(res.data));
      const normalized = this.normalizeEvaluateResponse(res.data);
      return { ...normalized, original: res.data };
    } catch (e: any) {
      this.logger.error('sendAudioToAI error: ' + (e?.message ?? e));
      throw new Error('Failed to process audio file');
    }
  }

  async generateQuestion() {
    try {
      const res = await axios.post(`${this.aiBaseUrl}/generate-examiner-response`, {
        conversation_history: [],
        current_part: 1,
        question_count: 0,
      }, {
        timeout: 30000,
      });

      this.logger.debug('Raw /generate-examiner-response response: ' + JSON.stringify(res.data));
      return { question: res.data.response ?? 'Can you tell me about your hometown?' };
    } catch (e: any) {
      this.logger.error('generateQuestion error: ' + (e?.message ?? e));
      return { question: 'Can you tell me about your hometown?' };
    }
  }
}