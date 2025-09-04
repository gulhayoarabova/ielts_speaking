import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';

interface ConversationEntry {
  type: 'candidate' | 'examiner';
  content: string;
  timestamp: Date;
  audioData?: string;
}

interface UserSession {
  socketId: string;
  userId?: string;
  sessionId: string;
  currentPart: number;
  questionCount: number;
  conversationHistory: ConversationEntry[];
  connectedAt: Date;
  isRecording: boolean;
  currentQuestion?: string;
}

@Injectable()
export class VoiceChatService {
  private readonly logger = new Logger(VoiceChatService.name);
  private aiBaseUrl = 'https://ielts-speaking-9aqo.onrender.com';

  async transcribeAudioChunk(audioChunk: string): Promise<string> {
    try {
      const audioBuffer = Buffer.from(audioChunk, 'base64');
      
      const formData = new FormData();
      formData.append('audio', audioBuffer, {
        filename: 'chunk.wav',
        contentType: 'audio/wav',
      });

      // Use a direct transcription endpoint (you may need to add this to your FastAPI)
      const response = await axios.post(`${this.aiBaseUrl}/transcribe`, formData, {
        headers: formData.getHeaders(),
        timeout: 10000,
      });

      return response.data.transcript || '';
    } catch (error) {
      this.logger.error('Transcription error:', error);
      return '';
    }
  }

  async generateSpeech(text: string): Promise<string | null> {
    try {
      // Call your FastAPI TTS endpoint
      const response = await axios.post(`${this.aiBaseUrl}/synthesize-speech`, {
        text,
      }, {
        responseType: 'arraybuffer',
        timeout: 15000,
      });

      return Buffer.from(response.data).toString('base64');
    } catch (error) {
      this.logger.error('TTS generation error:', error);
      return null;
    }
  }

  async getInitialGreeting(): Promise<string> {
    const greetings = [
      "Hello! Welcome to your IELTS Speaking practice session. My name is Sarah and I'll be your examiner today. Can you please tell me your full name?",
      "Good morning! I'm David, your IELTS speaking examiner. Let's start with your name - could you tell me what I should call you?",
      "Hello there! I'm Lisa and I'll be conducting your IELTS speaking test today. To begin, could you please state your full name for me?",
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  async generateExaminerResponse(
    conversationHistory: ConversationEntry[],
    currentPart: number,
    questionCount: number
  ): Promise<string> {
    try {
      const response = await axios.post(`${this.aiBaseUrl}/generate-examiner-response`, {
        conversation_history: conversationHistory.map(entry => ({
          type: entry.type,
          content: entry.content,
          timestamp: entry.timestamp.toISOString(),
        })),
        current_part: currentPart,
        question_count: questionCount,
      });

      return response.data.response || "Thank you for that answer. Let me ask you another question.";
    } catch (error) {
      this.logger.error('Examiner response generation error:', error);
      return this.getFallbackQuestion(currentPart);
    }
  }

  async generateQuestion(currentPart: number, conversationHistory: ConversationEntry[]): Promise<string> {
    try {
      const endpoint = currentPart === 1 ? '/generate-part1' : 
                     currentPart === 2 ? '/generate-part2' : 
                     '/generate-part3';

      const response = await axios.get(`${this.aiBaseUrl}${endpoint}`);
      
      if (currentPart === 1 || currentPart === 3) {
        const questions = response.data.questions || [];
        return questions[0] || this.getFallbackQuestion(currentPart);
      } else {
        return response.data.question || this.getFallbackQuestion(currentPart);
      }
    } catch (error) {
      this.logger.error('Question generation error:', error);
      return this.getFallbackQuestion(currentPart);
    }
  }

  async generateQuickEvaluation(answer: string, question: string) {
    try {
      const response = await axios.post(`${this.aiBaseUrl}/quick-evaluate`, {
        answer,
        question,
      });

      return {
        feedback: response.data.feedback || "Good response!",
        score: response.data.score || 6.0,
        strengths: response.data.strengths || [],
        suggestions: response.data.suggestions || [],
      };
    } catch (error) {
      this.logger.error('Quick evaluation error:', error);
      return {
        feedback: "Keep going! You're doing well.",
        score: 6.0,
        strengths: ["Clear communication"],
        suggestions: ["Try to elaborate more on your points"],
      };
    }
  }

  async generateRealtimeFeedback(recentHistory: ConversationEntry[]) {
    try {
      const response = await axios.post(`${this.aiBaseUrl}/realtime-feedback`, {
        recent_conversation: recentHistory.map(entry => ({
          type: entry.type,
          content: entry.content,
        })),
      });

      return {
        feedback: response.data.feedback || "You're doing well!",
        fluency: response.data.fluency || 6.0,
        vocabulary: response.data.vocabulary || 6.0,
        grammar: response.data.grammar || 6.0,
        pronunciation: response.data.pronunciation || 6.0,
        suggestions: response.data.suggestions || [],
      };
    } catch (error) {
      this.logger.error('Realtime feedback error:', error);
      return {
        feedback: "Keep up the good work!",
        fluency: 6.0,
        vocabulary: 6.0,
        grammar: 6.0,
        pronunciation: 6.0,
        suggestions: ["Continue speaking naturally"],
      };
    }
  }

  async generateFinalEvaluation(conversationHistory: ConversationEntry[]) {
    try {
      // Extract questions and answers for the final evaluation
      const questions: string[] = [];
      const answers: string[] = [];

      for (let i = 0; i < conversationHistory.length - 1; i++) {
        if (conversationHistory[i].type === 'examiner' && 
            conversationHistory[i + 1].type === 'candidate') {
          questions.push(conversationHistory[i].content);
          answers.push(conversationHistory[i + 1].content);
        }
      }

      const response = await axios.post(`${this.aiBaseUrl}/evaluate`, {
        questions: JSON.stringify(questions),
        answers: JSON.stringify(answers),
      });

      return {
        overall_band: response.data.evaluation?.overall_band || 6.0,
        fluency: response.data.evaluation?.fluency || 6.0,
        vocabulary: response.data.evaluation?.vocabulary || 6.0,
        grammar: response.data.evaluation?.grammar || 6.0,
        pronunciation: response.data.evaluation?.pronunciation || 6.0,
        strengths: response.data.evaluation?.strengths || [],
        weaknesses: response.data.evaluation?.weaknesses || [],
        detailed_feedback: response.data.evaluation?.detailed_feedback || "Good overall performance!",
        improved_answers: response.data.evaluation?.improved_answers || [],
      };
    } catch (error) {
      this.logger.error('Final evaluation error:', error);
      return {
        overall_band: 6.0,
        fluency: 6.0,
        vocabulary: 6.0,
        grammar: 6.0,
        pronunciation: 6.0,
        strengths: ["Completed the test"],
        weaknesses: ["Continue practicing"],
        detailed_feedback: "Thank you for completing the IELTS speaking practice session!",
        improved_answers: [],
      };
    }
  }

  getPartInstruction(part: number): string {
    const instructions = {
      1: "In Part 1, I'll ask you questions about yourself and familiar topics. Please give short, direct answers of about 20-30 seconds each.",
      2: "In Part 2, I'll give you a topic card. You'll have 1 minute to prepare notes, then speak for 1-2 minutes on the topic. I'll tell you when to start.",
      3: "In Part 3, we'll have a discussion about more abstract ideas related to the Part 2 topic. Please give longer, more detailed responses.",
    };

    return instructions[part] || instructions[1];
  }

  private getFallbackQuestion(part: number): string {
    const fallbacks = {
      1: [
        "Can you tell me about your hometown?",
        "What do you like to do in your free time?",
        "Do you work or study?",
        "What kind of music do you enjoy?"
      ],
      2: [
        "Describe a memorable day from your past. You should say: what day it was, what happened, who you were with, and explain why it was memorable.",
        "Describe a place you like to visit. You should say: where it is, what you can do there, who you go there with, and explain why you like this place."
      ],
      3: [
        "How do you think technology has changed the way people communicate?",
        "What are the advantages and disadvantages of living in a big city?",
        "Do you think it's important for people to learn about other cultures?",
        "How might education change in the future?"
      ]
    };

    const questions = fallbacks[part] || fallbacks[1];
    return questions[Math.floor(Math.random() * questions.length)];
  }

  async saveSession(session: UserSession): Promise<void> {
    try {
      // Here you could save session data to database
      this.logger.log(`Session ${session.sessionId} completed with ${session.conversationHistory.length} exchanges`);
      
      // Optional: Send session data to external storage or analytics
      await axios.post(`${this.aiBaseUrl}/save-session`, {
        session_id: session.sessionId,
        conversation_history: session.conversationHistory,
        total_duration: Date.now() - session.connectedAt.getTime(),
        parts_completed: session.currentPart,
      }).catch(error => {
        this.logger.warn('Failed to save session to AI service:', error.message);
      });

    } catch (error) {
      this.logger.error('Session save error:', error);
    }
  }

  // Utility method to check audio quality
  async analyzeAudioQuality(audioChunk: string): Promise<{
    quality: 'good' | 'fair' | 'poor';
    suggestions: string[];
  }> {
    try {
      const response = await axios.post(`${this.aiBaseUrl}/analyze-audio-quality`, {
        audio_chunk: audioChunk,
      });

      return {
        quality: response.data.quality || 'fair',
        suggestions: response.data.suggestions || [],
      };
    } catch (error) {
      return {
        quality: 'fair',
        suggestions: ['Ensure you are in a quiet environment'],
      };
    }
  }

  // Method to get pronunciation feedback
  async getPronunciationFeedback(audioChunk: string, transcript: string): Promise<{
    score: number;
    feedback: string;
    problematic_words: string[];
  }> {
    try {
      const response = await axios.post(`${this.aiBaseUrl}/pronunciation-feedback`, {
        audio_chunk: audioChunk,
        transcript,
      });

      return {
        score: response.data.score || 6.0,
        feedback: response.data.feedback || "Good pronunciation overall",
        problematic_words: response.data.problematic_words || [],
      };
    } catch (error) {
      return {
        score: 6.0,
        feedback: "Continue practicing pronunciation",
        problematic_words: [],
      };
    }
  }
}