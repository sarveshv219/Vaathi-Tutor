export interface Page {
  page_id: number;
}

export interface UploadResponse {
  doc_id: string;
  name: string;
  page_count: number;
}

export interface PagesResponse {
  pages: Page[];
}

export interface ExplanationResponse {
  page_id: number;
  explanation: string;
}

export interface Citation {
  page_id: number;
}

export interface QAResponse {
  answer: string;
  citations?: Citation[];
  used_contexts?: string[];
}

export interface FlashcardItem {
  q: string;
  a: string;
}

export interface FlashcardsResponse {
  items: FlashcardItem[];
}

export interface QuizItem {
  question: string;
  options: string[];
  answer: string;
}

export interface QuizResponse {
  items: QuizItem[];
}

export interface CheatsheetResponse {
  content: string;
}

export interface STTResponse {
  text: string;
}
