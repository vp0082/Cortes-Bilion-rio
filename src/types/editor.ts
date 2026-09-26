export type CaptionPreset = 'viral' | 'minimal' | 'podcast' | 'gamer' | 'premium' | 'impact';

export interface CaptionStyleConfig {
  preset: CaptionPreset;
  fontFamily: string;
  fontSize: number; // in pixels relative to preview
  textColor: string;
  highlightColor: string;
  strokeColor: string;
  strokeWidth: number;
  bgColor: string;
  hasBackground: boolean;
  uppercase: boolean;
  positionY: number; // percentage from top, e.g. 75
  animation: 'pop' | 'glow' | 'bounce' | 'fade';
}

export interface WordTimestamp {
  word: string;
  start: number; // in seconds
  end: number;
}

export interface ViralityFactor {
  type: 'hook' | 'emotion' | 'conflict' | 'humor' | 'insight' | 'qa';
  label: string;
  description: string;
}

export interface DubbingConfig {
  enabled: boolean;
  voiceId: 'felipe' | 'camila' | 'rodrigo' | 'lucas';
  voiceName: string;
  volumeDuck: number; // 0 to 1, how much to lower original video (e.g. 0.75)
  dubbingVolume: number; // 0 to 1, volume of Portuguese voice
  speechRate: number; // 0.8 to 1.3
  portugueseText: string;
  originalText?: string;
  sourceLanguage?: 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';
  tone?: 'natural' | 'viral' | 'formal';
  translatedTranscript?: WordTimestamp[];
}

export interface Clip {
  id: string;
  projectId: string;
  title: string;
  startTime: number; // seconds
  endTime: number; // seconds
  duration: number; // seconds
  viralScore: number; // 0-100
  viralTag: string; // e.g., "Alto Potencial", "Hook Magnético"
  whyViral: string;
  viralityHooks: string[];
  transcript: WordTimestamp[];
  fullText: string;
  framingMode: 'auto' | 'left' | 'center' | 'right' | 'split';
  zoomEffect: boolean;
  silenceRemoved: boolean;
  speed: number;
  volume: number;
  filter: 'none' | 'vibrant' | 'cinematic' | 'warm' | 'clean';
  captionStyle: CaptionStyleConfig;
  titleAi: string;
  descriptionAi: string;
  hashtagsAi: string[];
  dubbing?: DubbingConfig;
}

export interface VideoMetadata {
  id: string;
  name: string;
  duration: number; // seconds
  resolution: string; // e.g., "1920x1080 (16:9)"
  fileSizeFormatted: string;
  fps: number;
  url: string;
  thumbnailUrl: string;
}

export interface Project {
  id: string;
  name: string;
  videoMetadata: VideoMetadata;
  createdAt: string;
  status: 'ready' | 'processing' | 'analyzed';
  clipsCount: number;
  clips: Clip[];
}

export interface DashboardStats {
  videosProcessed: number;
  clipsGenerated: number;
  timeSavedHours: number;
  clipsExported: number;
}
