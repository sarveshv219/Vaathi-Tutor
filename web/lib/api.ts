// TypeScript API client for AI Tutor backend
// Generated for Next.js integration with full type safety

const API_BASE_URL = typeof window !== 'undefined' 
  ? (window as any).NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
  : 'http://127.0.0.1:8000';

// Types matching backend Pydantic models
export interface UploadResp {
  doc_id: string;
  name: string;
  page_count: number;
}

export interface PageInfo {
  page_id: number;
}

export interface PagesResp {
  pages: PageInfo[];
}

export interface ExplainResp {
  page_id: number;
  explanation: string;
}

export interface QAReq {
  question: string;
  k?: number;
}

export interface QAResp {
  answer: string;
}

export interface FlashcardsResp {
  items: any[];
}

export interface QuizResp {
  items: any[];
}

export interface CheatsheetResp {
  content: string;
}

export interface TTSResp {
  audio_url: string;
}

export interface STTResp {
  text: string;
}

// API Client Class
export class AITutorClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Ingest endpoints
  async uploadDocument(file: File, name?: string): Promise<UploadResp> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);

    const response = await fetch(`${this.baseUrl}/ingest/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Pages endpoints
  async listPages(docId: string): Promise<PagesResp> {
    return this.request<PagesResp>(`/pages/${docId}/pages`);
  }

  async explainPage(docId: string, pageId: number): Promise<ExplainResp> {
    return this.request<ExplainResp>(`/pages/${docId}/pages/${pageId}/explain`);
  }

  // QA endpoints
  async askQuestion(docId: string, req: QAReq): Promise<QAResp> {
    return this.request<QAResp>(`/qa/${docId}/qa`, {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  // Study aids endpoints
  async getFlashcards(docId: string, pageId: number): Promise<FlashcardsResp> {
    return this.request<FlashcardsResp>(`/study/${docId}/pages/${pageId}/flashcards`);
  }

  async getQuiz(docId: string, pageId: number): Promise<QuizResp> {
    return this.request<QuizResp>(`/study/${docId}/pages/${pageId}/quiz`);
  }

  async getCheatsheet(docId: string, pageId: number): Promise<CheatsheetResp> {
    return this.request<CheatsheetResp>(`/study/${docId}/pages/${pageId}/cheatsheet`);
  }

  // Media endpoints
  async textToSpeech(text: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/media/tts?text=${encodeURIComponent(text)}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`TTS failed: ${response.statusText}`);
    }

    return response.blob();
  }

  async speechToText(audioFile: File): Promise<STTResp> {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await fetch(`${this.baseUrl}/media/stt`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`STT failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Default export singleton instance
const client = new AITutorClient();
export default client;

// Named exports for direct function use
export const uploadDocument = (file: File, name?: string) => client.uploadDocument(file, name);
export const listPages = (docId: string) => client.listPages(docId);
export const explainPage = (docId: string, pageId: number) => client.explainPage(docId, pageId);
export const askQuestion = (docId: string, req: QAReq) => client.askQuestion(docId, req);
export const getFlashcards = (docId: string, pageId: number) => client.getFlashcards(docId, pageId);
export const getQuiz = (docId: string, pageId: number) => client.getQuiz(docId, pageId);
export const getCheatsheet = (docId: string, pageId: number) => client.getCheatsheet(docId, pageId);
export const textToSpeech = (text: string) => client.textToSpeech(text);
export const speechToText = (audioFile: File) => client.speechToText(audioFile);
