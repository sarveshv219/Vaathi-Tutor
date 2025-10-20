import type {
  UploadResponse,
  PagesResponse,
  ExplanationResponse,
  QAResponse,
  FlashcardsResponse,
  FlashcardItem,
  QuizResponse,
  QuizItem,
  CheatsheetResponse,
  STTResponse,
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const USE_MOCK = false; // Connected to real backend

// Mock data for testing
const mockDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

const mockExplanations: Record<string, string> = {
  '1': 'This page introduces the fundamental concepts of machine learning, including supervised and unsupervised learning paradigms. The key difference is that supervised learning uses labeled data to train models, while unsupervised learning finds patterns in unlabeled data.',
  '2': 'Neural networks are computational models inspired by biological neurons. They consist of layers of interconnected nodes that process information through weighted connections. The learning process involves adjusting these weights to minimize prediction errors.',
  '3': 'Deep learning represents a subset of machine learning that uses neural networks with multiple hidden layers. This architecture enables the model to learn hierarchical representations of data, making it particularly effective for complex tasks like image recognition and natural language processing.',
};

const mockFlashcards: Record<string, FlashcardItem[]> = {
  '1': [
    { q: 'What is supervised learning?', a: 'A type of machine learning that uses labeled training data to learn patterns and make predictions.' },
    { q: 'What is unsupervised learning?', a: 'A type of machine learning that finds hidden patterns in unlabeled data without predefined outcomes.' },
    { q: 'Name three common ML algorithms', a: 'Linear Regression, Decision Trees, and Neural Networks' },
  ],
};

const mockQuizzes: Record<string, QuizItem[]> = {
  '1': [
    {
      question: 'Which type of learning requires labeled data?',
      options: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'Transfer Learning'],
      answer: 'Supervised Learning',
    },
    {
      question: 'What is the primary goal of unsupervised learning?',
      options: ['Classification', 'Pattern Discovery', 'Prediction', 'Regression'],
      answer: 'Pattern Discovery',
    },
    {
      question: 'Which algorithm is commonly used for classification?',
      options: ['K-Means', 'Linear Regression', 'Decision Trees', 'PCA'],
      answer: 'Decision Trees',
    },
  ],
};

const mockCheatsheets: Record<string, string> = {
  '1': `# Machine Learning Fundamentals

## Key Concepts
• **Supervised Learning**: Uses labeled data for training
  - Classification (discrete outputs)
  - Regression (continuous outputs)

• **Unsupervised Learning**: Finds patterns in unlabeled data
  - Clustering
  - Dimensionality reduction

## Common Algorithms
1. Linear Regression
2. Decision Trees
3. Neural Networks
4. K-Means Clustering
5. Support Vector Machines (SVM)

## Important Metrics
- Accuracy
- Precision & Recall
- F1 Score
- Mean Squared Error (MSE)`,
};

export const uploadFile = async (file: File, name?: string): Promise<UploadResponse> => {
  if (USE_MOCK) {
    await mockDelay();
    return {
      doc_id: 'demo-doc-' + Date.now(),
      name: name || file.name,
      page_count: 5,
    };
  }

  const formData = new FormData();
  formData.append('file', file);
  if (name) formData.append('name', name);

  console.log('🔵 Uploading to:', `${API_BASE}/ingest/upload`);
  console.log('🔵 File:', file.name, file.size, 'bytes');

  const response = await fetch(`${API_BASE}/ingest/upload`, {
    method: 'POST',
    body: formData,
  });

  console.log('🔵 Response status:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Upload failed:', errorText);
    throw new Error(`Failed to upload file: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ Upload successful:', data);
  return data;
};

export const listPages = async (docId: string): Promise<PagesResponse> => {
  if (USE_MOCK) {
    await mockDelay(300);
    return {
      pages: [
        { page_id: 1 },
        { page_id: 2 },
        { page_id: 3 },
        { page_id: 4 },
        { page_id: 5 },
      ],
    };
  }

  console.log('🔵 Fetching pages from:', `${API_BASE}/pages/${docId}/pages`);

  const response = await fetch(`${API_BASE}/pages/${docId}/pages`);
  
  console.log('🔵 Pages response status:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Failed to fetch pages:', errorText);
    throw new Error(`Failed to fetch pages: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ Pages fetched:', data);
  return data;
};

export const getExplanation = async (docId: string, pageId: number, model?: string): Promise<ExplanationResponse> => {
  if (USE_MOCK) {
    await mockDelay(1200);
    return {
      page_id: pageId,
      explanation: mockExplanations[pageId.toString()] || 'This page covers important concepts related to the topic. The information presented here builds upon previous sections and introduces new ideas that will be explored in more detail later.',
    };
  }

  let url = `${API_BASE}/pages/${docId}/pages/${pageId}/explain`;
  if (model) {
    url += `?model=${encodeURIComponent(model)}`;
  }
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch explanation');
  }

  return response.json();
};

export const askQuestion = async (
  docId: string,
  question: string,
  k?: number,
  pageId?: number,
  model?: string
): Promise<QAResponse> => {
  if (USE_MOCK) {
    await mockDelay(1500);
    return {
      answer: `Based on the document content, here's what I found regarding "${question}": The key concepts include understanding the fundamental principles and their practical applications. This topic is covered in detail across multiple pages of the document.`,
      citations: [
        { page_id: 1 },
        { page_id: 3 },
      ],
      used_contexts: ['Context from page 1', 'Context from page 3'],
    };
  }

  const response = await fetch(`${API_BASE}/qa/${docId}/qa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question, k, page_id: pageId, model }),
  });

  if (!response.ok) {
    throw new Error('Failed to ask question');
  }

  return response.json();
};

export const getFlashcards = async (docId: string, pageId: number, model?: string): Promise<FlashcardsResponse> => {
  if (USE_MOCK) {
    await mockDelay(1000);
    return {
      items: mockFlashcards[pageId.toString()] || [
        { q: 'What is the main concept on this page?', a: 'The page discusses fundamental principles and their applications in the field.' },
        { q: 'Why is this topic important?', a: 'Understanding these concepts is crucial for building a strong foundation in the subject.' },
        { q: 'How does this relate to previous topics?', a: 'This builds upon earlier concepts and introduces new frameworks for analysis.' },
      ],
    };
  }

  let url = `${API_BASE}/study/${docId}/pages/${pageId}/flashcards`;
  if (model) {
    url += `?model=${encodeURIComponent(model)}`;
  }
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch flashcards');
  }

  return response.json();
};

export const getQuiz = async (docId: string, pageId: number, model?: string): Promise<QuizResponse> => {
  if (USE_MOCK) {
    await mockDelay(1000);
    return {
      items: mockQuizzes[pageId.toString()] || [
        {
          question: 'What is the main topic covered on this page?',
          options: ['Topic A', 'Topic B', 'Topic C', 'Topic D'],
          answer: 'Topic B',
        },
        {
          question: 'Which concept is most important?',
          options: ['Concept 1', 'Concept 2', 'Concept 3', 'Concept 4'],
          answer: 'Concept 2',
        },
        {
          question: 'How does this apply in practice?',
          options: ['Application A', 'Application B', 'Application C', 'Application D'],
          answer: 'Application C',
        },
      ],
    };
  }

  let url = `${API_BASE}/study/${docId}/pages/${pageId}/quiz`;
  if (model) {
    url += `?model=${encodeURIComponent(model)}`;
  }
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch quiz');
  }

  return response.json();
};

export const getCheatsheet = async (docId: string, pageId: number, model?: string): Promise<CheatsheetResponse> => {
  if (USE_MOCK) {
    await mockDelay(800);
    return {
      content: mockCheatsheets[pageId.toString()] || `# Page ${pageId} Summary

## Key Points
• Important concept 1
• Important concept 2
• Important concept 3

## Definitions
- Term A: Brief explanation
- Term B: Brief explanation
- Term C: Brief explanation

## Examples
1. Example scenario 1
2. Example scenario 2
3. Example scenario 3`,
    };
  }

  let url = `${API_BASE}/study/${docId}/pages/${pageId}/cheatsheet`;
  if (model) {
    url += `?model=${encodeURIComponent(model)}`;
  }
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch cheatsheet');
  }

  return response.json();
};


export const tts = async (text: string): Promise<Blob> => {
  if (USE_MOCK) {
    await mockDelay(800);
    // Create a simple audio blob for demo (silent audio)
    const audioContext = new AudioContext();
    const duration = 3; // 3 seconds of silence
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    
    // Create a simple beep sound
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      data[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.1;
    }
    
    // Convert to WAV blob (simplified)
    const blob = new Blob([new Uint8Array(1000)], { type: 'audio/mp3' });
    return blob;
  }

  const response = await fetch(`${API_BASE}/media/tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate audio');
  }

  return response.blob();
};

export const stt = async (file: File): Promise<STTResponse> => {
  if (USE_MOCK) {
    await mockDelay(1000);
    return {
      text: 'What are the key differences between supervised and unsupervised learning?',
    };
  }

  const formData = new FormData();
  formData.append('audio', file);

  const response = await fetch(`${API_BASE}/media/stt`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to transcribe audio');
  }

  return response.json();
};
