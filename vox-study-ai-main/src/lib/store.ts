import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Page {
  page_id: number;
}

interface Document {
  docId: string;
  name: string;
  pages: Page[];
  pageId: number;
}

interface UIState {
  theme: 'light' | 'dark';
  dyslexiaFont: boolean;
  textScale: 100 | 115 | 130;
  highContrast: boolean;
  selectedModel: string;
}

interface AudioState {
  blob?: Blob;
  rate: number;
  isPlaying: boolean;
}

interface QAState {
  lastQuestion?: string;
  lastAnswer?: string;
  citations?: number[];
}

interface RecentDoc {
  docId: string;
  name: string;
  lastVisited: number;
  pageCount: number;
}

interface Store {
  doc: Document | null;
  ui: UIState;
  audio: AudioState;
  qa: QAState;
  recentDocs: RecentDoc[];
  
  setDocument: (doc: Document) => void;
  setPage: (pageId: number) => void;
  toggleTheme: () => void;
  toggleDyslexiaFont: () => void;
  setTextScale: (scale: 100 | 115 | 130) => void;
  toggleHighContrast: () => void;
  setSelectedModel: (model: string) => void;
  setAudioBlob: (blob: Blob) => void;
  setAudioRate: (rate: number) => void;
  setAudioPlaying: (isPlaying: boolean) => void;
  setQA: (question: string, answer: string, citations?: number[]) => void;
  addRecentDoc: (doc: { docId: string; name: string; pageCount: number }) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      doc: null,
      ui: {
        theme: 'light',
        dyslexiaFont: false,
        textScale: 100,
        highContrast: false,
        selectedModel: 'gemini-1.5-flash',
      },
      audio: {
        rate: 1.0,
        isPlaying: false,
      },
      qa: {},
      recentDocs: [],

      setDocument: (doc) => set({ doc }),
      setPage: (pageId) => set((state) => state.doc ? { doc: { ...state.doc, pageId } } : {}),
      toggleTheme: () => set((state) => ({ 
        ui: { ...state.ui, theme: state.ui.theme === 'light' ? 'dark' : 'light' } 
      })),
      toggleDyslexiaFont: () => set((state) => ({ 
        ui: { ...state.ui, dyslexiaFont: !state.ui.dyslexiaFont } 
      })),
      setTextScale: (scale) => set((state) => ({ 
        ui: { ...state.ui, textScale: scale } 
      })),
      toggleHighContrast: () => set((state) => ({ 
        ui: { ...state.ui, highContrast: !state.ui.highContrast } 
      })),
      setSelectedModel: (model) => set((state) => ({ 
        ui: { ...state.ui, selectedModel: model } 
      })),
      setAudioBlob: (blob) => set((state) => ({ 
        audio: { ...state.audio, blob } 
      })),
      setAudioRate: (rate) => set((state) => ({ 
        audio: { ...state.audio, rate } 
      })),
      setAudioPlaying: (isPlaying) => set((state) => ({ 
        audio: { ...state.audio, isPlaying } 
      })),
      setQA: (question, answer, citations) => set({ 
        qa: { lastQuestion: question, lastAnswer: answer, citations } 
      }),
      addRecentDoc: (doc) => set((state) => {
        const filtered = state.recentDocs.filter(d => d.docId !== doc.docId);
        return {
          recentDocs: [
            { ...doc, lastVisited: Date.now() },
            ...filtered
          ].slice(0, 10)
        };
      }),
    }),
    {
      name: 'ai-tutor-storage',
      partialize: (state) => ({ 
        ui: state.ui,
        recentDocs: state.recentDocs,
      }),
    }
  )
);
