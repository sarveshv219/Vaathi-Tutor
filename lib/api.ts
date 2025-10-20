// API client for AI Tutor Backend
// Copy of web/lib/api.ts for easier imports

const API_BASE_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000')
  : 'http://127.0.0.1:8000';

// Types
export interface UploadResp {
  doc_id: string;
  name: string;
  page_count: number;
}

export interface ExplainResp {
  page_id: number;
  explanation: string;
}

export interface PagesResp {
  pages: { page_id: number }[];
}

export interface QAReq {
  question: string;
  k?: number;
}

export interface QAResp {
  answer: string;
}

// API Client
export class AITutorClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Upload document
  async uploadDocument(file: File, name?: string): Promise<UploadResp> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);

    const response = await fetch(`${this.baseUrl}/ingest/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Validate document by listing pages
  async listPages(docId: string): Promise<PagesResp> {
    const response = await fetch(`${this.baseUrl}/pages/${docId}/pages`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to list pages' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Get explanation for a specific page
  async explainPage(docId: string, pageId: number): Promise<ExplainResp> {
    const response = await fetch(`${this.baseUrl}/pages/${docId}/pages/${pageId}/explain`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to get explanation' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Ask a question
  async askQuestion(docId: string, question: string, k: number = 3): Promise<QAResp> {
    const response = await fetch(`${this.baseUrl}/qa/${docId}/qa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, k }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to answer question' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Get flashcards for a page
  async getFlashcards(docId: string, pageId: number) {
    const response = await fetch(`${this.baseUrl}/study/${docId}/pages/${pageId}/flashcards`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to get flashcards' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Get quiz for a page
  async getQuiz(docId: string, pageId: number) {
    const response = await fetch(`${this.baseUrl}/study/${docId}/pages/${pageId}/quiz`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to get quiz' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }
}

// Default singleton instance
const client = new AITutorClient();
export default client;

// Named exports for convenience
export const uploadDocument = (file: File, name?: string) => client.uploadDocument(file, name);
export const listPages = (docId: string) => client.listPages(docId);
export const explainPage = (docId: string, pageId: number) => client.explainPage(docId, pageId);
export const askQuestion = (docId: string, question: string, k?: number) => client.askQuestion(docId, question, k);
export const getFlashcards = (docId: string, pageId: number) => client.getFlashcards(docId, pageId);
export const getQuiz = (docId: string, pageId: number) => client.getQuiz(docId, pageId);
