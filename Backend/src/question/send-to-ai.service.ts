// send-to-ai.service.ts (yangilangan)
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class SendToAiService {
  private readonly logger = new Logger(SendToAiService.name);
  private aiBaseUrl = process.env.AI_SERVICE_URL || 'https://ielts-speaking-9aqo.onrender.com';

  // normalize helper
  private normalizeEvaluateResponse(data: any) {
    // many AI services return different shapes.
    // try common keys first, then fallback defaults.
    const normalized = {
      transcript: '',
      evaluation: {
        feedback: '',
        overall_band: null,
        score: null,
        strengths: [],
        suggestions: [],
      },
      ai_response: '',
      ai_audio_base64: null,
      raw: data,
    };

    try {
      // If API returns top-level 'evaluation'
      if (data?.evaluation) {
        normalized.evaluation = {
          feedback: data.evaluation.detailed_feedback ?? data.evaluation.feedback ?? '',
          overall_band: data.evaluation.overall_band ?? data.evaluation.score ?? null,
          score: data.evaluation.overall_band ?? data.evaluation.score ?? null,
          strengths: data.evaluation.strengths ?? [],
          suggestions: data.evaluation.suggestions ?? [],
        };
      }
      // Some services return { transcript, evaluation }
      if (data?.transcript) normalized.transcript = data.transcript;
      // Some return evaluation as top-level fields
      if (!normalized.evaluation.feedback && data?.feedback) normalized.evaluation.feedback = data.feedback;
      if (!normalized.evaluation.score && data?.score) normalized.evaluation.score = data.score;
      // Some return ai_response or message
      if (data?.response) normalized.ai_response = data.response;
      if (data?.ai_response) normalized.ai_response = data.ai_response;
      // Some return audio as base64 under audio or audio_data
      if (data?.audio || data?.audio_data) normalized.ai_audio_base64 = data.audio ?? data.audio_data;
    } catch (e: any) {
      this.logger.warn('Normalization partial failure: ' + e.message);
    }

    return normalized;
  }

  async sendChunkToAI(question: string, chunkBase64: string) {
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
      // For debugging, also attach raw payload
      return { ...normalized, original: res.data };
    } catch (e: any) {
      this.logger.error('sendChunkToAI error: ' + (e?.message ?? e));
      return { transcript: '', evaluation: { feedback: '', score: null }, ai_response: '', ai_audio_base64: null, original: null, error: e?.message ?? String(e) };
    }
  }

  // keep other methods (sendAudioToAI, generateQuestion) unchanged or update similarly...
}
