import { Injectable } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class SendToAiService {
  async sendAudioToAI(filePath: string, question: string) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const formData = new FormData();
    formData.append('question', question); // required by Python API
    formData.append('audio', fs.createReadStream(filePath), {
      filename: 'audio.wav',
      contentType: 'audio/wav',
    });

    const response = await axios.post(
      'https://ielts-speaking-9aqo.onrender.com/evaluate', // ✅ correct AI app endpoint
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        maxBodyLength: Infinity,
      },
    );

    return response.data;
  }
  async generateQuestion() {
    const res = await axios.get('https://ielts-speaking-9aqo.onrender.com/generate-question');
    return res.data; // return generated question JSON
  }
}
