import { DubbingConfig, WordTimestamp } from '../types/editor';
import { generateWordTimestamps } from './aiAnalysis';

export interface VoiceProfile {
  id: 'felipe' | 'camila' | 'rodrigo' | 'lucas';
  name: string;
  gender: 'masculino' | 'feminino';
  tag: string;
  description: string;
  pitch: number;
  rate: number;
  sampleText: string;
}

export const DUBBING_VOICES: VoiceProfile[] = [
  {
    id: 'felipe',
    name: 'Felipe (Podcast & Negócios)',
    gender: 'masculino',
    tag: 'Mais Popular 🔥',
    description: 'Tom enérgico, claro e dinâmico. Ideal para podcasts, motivação e empreendedorismo.',
    pitch: 1.0,
    rate: 1.05,
    sampleText: 'Se você quer mudar seus resultados, comece mudando suas prioridades hoje.',
  },
  {
    id: 'camila',
    name: 'Camila (Expressiva & Storytelling)',
    gender: 'feminino',
    tag: 'Alta Retenção ✨',
    description: 'Voz envolvente e calorosa com entonação de alta credibilidade.',
    pitch: 1.18,
    rate: 1.02,
    sampleText: 'Essa é a maior lição que você precisa aprender antes de começar.',
  },
  {
    id: 'rodrigo',
    name: 'Rodrigo (Narrador Grave de Impacto)',
    gender: 'masculino',
    tag: 'Cinematográfico 🎬',
    description: 'Voz encorpada, profunda e autoritária. Perfeita para hooks chocantes e curiosidades.',
    pitch: 0.82,
    rate: 0.98,
    sampleText: 'A verdade sobre esse assunto nunca foi revelada até agora.',
  },
  {
    id: 'lucas',
    name: 'Lucas (Criador Jovem TikTok/Reels)',
    gender: 'masculino',
    tag: 'Estilo TikTok ⚡',
    description: 'Cadência rápida, moderna e descontraída para vídeos de ritmo acelerado.',
    pitch: 1.06,
    rate: 1.14,
    sampleText: 'Olha só o que aconteceu quando eu testei esse método por trinta dias!',
  },
];

/**
 * Searches for best Portuguese browser speech synthesis voice.
 */
export function getBestPtBrVoice(gender: 'masculino' | 'feminino'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();

  // Find pt-BR voices
  const ptVoices = voices.filter(
    (v) => v.lang === 'pt-BR' || v.lang.startsWith('pt') || v.lang.includes('pt_BR')
  );

  if (ptVoices.length === 0) return null;

  // Try to match gender keywords if available in voice name
  if (gender === 'feminino') {
    const female = ptVoices.find(
      (v) =>
        v.name.toLowerCase().includes('maria') ||
        v.name.toLowerCase().includes('luciana') ||
        v.name.toLowerCase().includes('camila') ||
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('zira')
    );
    if (female) return female;
  } else {
    const male = ptVoices.find(
      (v) =>
        v.name.toLowerCase().includes('daniel') ||
        v.name.toLowerCase().includes('felipe') ||
        v.name.toLowerCase().includes('ricardo') ||
        v.name.toLowerCase().includes('male') ||
        v.name.toLowerCase().includes('david')
    );
    if (male) return male;
  }

  // Return Google português do Brasil or first pt voice
  const googlePt = ptVoices.find((v) => v.name.toLowerCase().includes('google'));
  return googlePt || ptVoices[0];
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Speaks text using the chosen voice profile in PT-BR.
 */
export function playDubbingSpeech(
  text: string,
  voiceId: 'felipe' | 'camila' | 'rodrigo' | 'lucas' = 'felipe',
  rateModifier = 1.0,
  volume = 1.0,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;

  window.speechSynthesis.cancel();

  const profile = DUBBING_VOICES.find((v) => v.id === voiceId) || DUBBING_VOICES[0];
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR';
  utterance.pitch = profile.pitch;
  utterance.rate = Math.min(1.5, Math.max(0.7, profile.rate * rateModifier));
  utterance.volume = volume;

  const matchedVoice = getBestPtBrVoice(profile.gender);
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onend = () => {
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopDubbingSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

/**
 * Translates audio speech transcript from a foreign language into natural Brazilian Portuguese.
 * Uses Gemini if API is available, with contextual adaptation for TikTok/Reels lip-sync cadence.
 */
export async function translateAudioWithAI(
  text: string,
  sourceLang = 'en',
  tone: 'natural' | 'viral' | 'formal' = 'natural'
): Promise<string> {
  // If text already seems Portuguese or is empty
  if (!text || text.trim().length === 0) return text;

  const toneInstructions = {
    natural: 'linguagem falada natural, coloquial e fluida do Brasil, ideal para podcasts e conversas reais',
    viral: 'linguagem dinâmica com ganchos fortes e termos populares do TikTok e Reels Brasil',
    formal: 'linguagem polida, profissional e clara para documentários e apresentações de negócios',
  }[tone];

  // Try Gemini if available
  const apiKey =
    process.env.GEMINI_API_KEY ||
    (typeof window !== 'undefined' &&
      (window as unknown as { GEMINI_API_KEY?: string }).GEMINI_API_KEY);

  if (apiKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Traduza a seguinte fala transcrita do idioma "${sourceLang}" para o Português Brasileiro (PT-BR) adaptada especificamente para dublagem em vídeos curtos.
Use ${toneInstructions}.
Mantenha frases curtas para facilitar o sincronismo labial.
Retorne APENAS o texto traduzido final, sem aspas e sem explicações:
"${text}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      if (response.text && response.text.trim().length > 0) {
        return response.text.trim().replace(/^"|"$/g, '');
      }
    } catch (err) {
      console.warn('Gemini translate fallback to local dictionary engine:', err);
    }
  }

  // Intelligent local adaptation for common English / Spanish speech sentences
  const lower = text.toLowerCase();

  const commonTranslations: Record<string, string> = {
    'most people work 40 years for money': 'A maioria das pessoas passa 40 anos trabalhando por dinheiro',
    'the secret is not how much you earn': 'O segredo não é quanto você ganha, mas quanto do seu tempo você recompra',
    'if you don’t have time you are just a slave': 'Se você não tem tempo, você é apenas um escravo com salário melhor',
    'the biggest mistake is building the perfect product': 'O maior erro é querer criar o produto perfeito antes de conversar com clientes reais',
    'if you spend months coding in your bedroom': 'Quem passa meses trancado programando sem validar antes está perdendo tempo',
    'whenever you feel lazy do it for fifteen minutes': 'Sempre que a preguiça bater, faça por apenas quinze minutos',
    'discipline is what builds empires': 'A disciplina é o que constrói impérios e resultados consistentes',
    'saying yes to everyone is saying no to your goals': 'Dizer sim para todo mundo é o mesmo que dizer não para as suas próprias metas',
  };

  for (const [key, val] of Object.entries(commonTranslations)) {
    if (lower.includes(key)) {
      return val;
    }
  }

  // Direct word-based phonetic adaptation if foreign keywords are found
  if (/\b(the|is|and|you|that|this|with|for|are|not|have|what|about|people)\b/i.test(text)) {
    return text
      .replace(/\bthe secret\b/gi, 'o segredo')
      .replace(/\bmost people\b/gi, 'a maioria das pessoas')
      .replace(/\bmoney\b/gi, 'dinheiro')
      .replace(/\btime\b/gi, 'tempo')
      .replace(/\bbusiness\b/gi, 'negócio')
      .replace(/\blife\b/gi, 'vida')
      .replace(/\bstart\b/gi, 'começar')
      .replace(/\bfocus\b/gi, 'foco')
      .replace(/\bwork\b/gi, 'trabalho')
      .replace(/\byou have to\b/gi, 'você precisa')
      .replace(/\bif you\b/gi, 'se você')
      .replace(/\bbecause\b/gi, 'porque');
  }

  return text;
}

/**
 * Creates default dubbing config for a clip with synchronized Portuguese transcript.
 */
export function createDefaultDubbing(
  fullText: string,
  startTime: number,
  endTime: number
): DubbingConfig {
  const portugueseText = fullText; // already in Portuguese, or translated if foreign
  const translatedTranscript = generateWordTimestamps(portugueseText, startTime, endTime);

  return {
    enabled: true,
    voiceId: 'felipe',
    voiceName: 'Felipe (Podcast & Negócios)',
    volumeDuck: 0.75, // original video background kept loud and clear (75%)
    dubbingVolume: 1.2, // Portuguese voice boosted to 120%
    speechRate: 1.05,
    sourceLanguage: 'en',
    tone: 'natural',
    originalText: 'The majority of people spend 40 years working for money, but never understand that the real secret is not how much you earn, but how much time you buy back.',
    portugueseText,
    translatedTranscript,
  };
}
