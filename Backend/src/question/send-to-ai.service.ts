import { Injectable } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class SendToAiService {
  private aiBaseUrl = 'https://ielts-speaking-9aqo.onrender.com';

  async sendChunkToAI(question: string, chunkBase64: string) {
    try {
      // Convert base64 → buffer
      const audioBuffer = Buffer.from(chunkBase64, 'base64');

      // Wrap as FormData for FastAPI
      const formData = new FormData();
      formData.append('questions', JSON.stringify([question]));
      formData.append('answers', JSON.stringify(['']));
      formData.append('audios', audioBuffer, {
        filename: 'chunk.wav',
        contentType: 'audio/wav',
      });

      const res = await axios.post(`${this.aiBaseUrl}/evaluate`, formData, {
        headers: formData.getHeaders(),
      });

      return res.data;
    } catch (e: any) {
      return { error: e.message };
    }
  }

  async sendAudioToAI(filePath: string, question: string) {
    const formData = new FormData();
    formData.append('questions', JSON.stringify([question]));
    formData.append('answers', JSON.stringify(['']));
    formData.append('audios', fs.createReadStream(filePath));

    try {
      const res = await axios.post(`${this.aiBaseUrl}/evaluate`, formData, {
        headers: formData.getHeaders(),
      });
      return res.data;
    } catch (e: any) {
      return { error: e.message };
    }
  }

  async generateQuestion() {
    try {
      const res = await axios.get(`${this.aiBaseUrl}/generate-part1`);
      return res.data;
    } catch (e: any) {
      return { error: e.message };
    }
  }
}
