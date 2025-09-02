import { Injectable } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class SendToAiService {
  async sendAudioToAI(filePath: string) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const response = await axios.post(
      'https://ielts-speaking-9aqo.onrender.com/evaluate',
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
}
