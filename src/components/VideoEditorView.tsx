import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Scissors,
  Sparkles,
  Subtitles,
  Sliders,
  Crop,
  Download,
  Share2,
  Check,
  Eye,
  EyeOff,
  FastForward,
  Palette,
  Layers,
  Wand2,
  RefreshCw,
  Copy,
  ChevronLeft,
  ChevronRight,
  Music,
  ShieldAlert,
  Languages,
  Globe,
  ArrowRightLeft,
  Loader2,
} from 'lucide-react';
import { Clip, CaptionPreset, CaptionStyleConfig, WordTimestamp, DubbingConfig } from '../types/editor';
import { CAPTION_PRESETS } from '../services/sampleData';
import {
  DUBBING_VOICES,
  playDubbingSpeech,
  stopDubbingSpeech,
  createDefaultDubbing,
  translateAudioWithAI,
} from '../services/dubbingService';
import { generateWordTimestamps } from '../services/aiAnalysis';

interface VideoEditorViewProps {
  clip: Clip;
  videoUrl: string;
  onUpdateClip: (updatedClip: Clip) => void;
  onExport: (clip: Clip) => void;
  onBack: () => void;
}

export const VideoEditorView: React.FC<VideoEditorViewProps> = ({
  clip,
  videoUrl,
  onUpdateClip,
  onExport,
  onBack,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(clip.startTime);
  const [volume, setVolume] = useState(clip.volume || 1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(clip.speed || 1.0);
  const [filter, setFilter] = useState(clip.filter || 'clean');
  const [zoomEffect, setZoomEffect] = useState(clip.zoomEffect);
  const [silenceRemoved, setSilenceRemoved] = useState(clip.silenceRemoved);
  const [framingMode, setFramingMode] = useState(clip.framingMode || 'auto');
  const [captionStyle, setCaptionStyle] = useState<CaptionStyleConfig>(clip.captionStyle || CAPTION_PRESETS.viral);
  const [showSafeAreas, setShowSafeAreas] = useState(true);
  const [activeTab, setActiveTab] = useState<'legendas' | 'enquadramento' | 'dublagem' | 'ia-texto' | 'audio'>('dublagem');

  // AI Dubbing State
  const [dubbing, setDubbing] = useState<DubbingConfig>(
    clip.dubbing || createDefaultDubbing(clip.fullText, clip.startTime, clip.endTime)
  );
  const [isTestingVoice, setIsTestingVoice] = useState<string | null>(null);

  // AI Audio Translation State
  const [sourceLang, setSourceLang] = useState<'en' | 'es' | 'fr' | 'de' | 'it' | 'pt'>(
    dubbing.sourceLanguage || 'en'
  );
  const [translationTone, setTranslationTone] = useState<'natural' | 'viral' | 'formal'>(
    dubbing.tone || 'natural'
  );
  const [originalAudioText, setOriginalAudioText] = useState(
    dubbing.originalText ||
      'The majority of people spend 40 years working for money, but never understand that the real secret is not how much you earn, but how much time you buy back.'
  );
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationSuccess, setTranslationSuccess] = useState(false);

  const [titleAi, setTitleAi] = useState(clip.titleAi || clip.title);
  const [descriptionAi, setDescriptionAi] = useState(clip.descriptionAi);
  const [hashtagsAi, setHashtagsAi] = useState<string[]>(clip.hashtagsAi || []);
  const [copiedText, setCopiedText] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Synchronize video currentTime with bounds
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = clip.startTime;
    setCurrentTime(clip.startTime);
  }, [clip.id, clip.startTime]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopDubbingSpeech();
    };
  }, []);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const time = video.currentTime;
    setCurrentTime(time);

    // Loop back to start if it exceeds clip.endTime
    if (time >= clip.endTime) {
      video.currentTime = clip.startTime;
      setCurrentTime(clip.startTime);
      if (dubbing.enabled) {
        stopDubbingSpeech();
      }
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      stopDubbingSpeech();
    } else {
      if (video.currentTime < clip.startTime || video.currentTime >= clip.endTime) {
        video.currentTime = clip.startTime;
      }

      // Audio ducking when dubbing is enabled
      if (dubbing.enabled) {
        video.volume = isMuted ? 0 : volume * dubbing.volumeDuck;
        playDubbingSpeech(
          dubbing.portugueseText,
          dubbing.voiceId,
          dubbing.speechRate,
          dubbing.dubbingVolume,
          () => {
            // Restore volume if voice finishes
            if (videoRef.current && !isMuted) {
              videoRef.current.volume = volume;
            }
          }
        );
      } else {
        video.volume = isMuted ? 0 : volume;
        stopDubbingSpeech();
      }

      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.max(clip.startTime, Math.min(clip.endTime, newTime));
    video.currentTime = clamped;
    setCurrentTime(clamped);
    if (dubbing.enabled && isPlaying) {
      stopDubbingSpeech();
      playDubbingSpeech(
        dubbing.portugueseText,
        dubbing.voiceId,
        dubbing.speechRate,
        dubbing.dubbingVolume
      );
    }
  };

  // Find active word in transcript
  const activeWordIndex = clip.transcript.findIndex(
    (w) => currentTime >= w.start && currentTime <= w.end
  );

  // Caption group around current time (max 2-3 words at a time for clean, compact shorts look)
  const getVisibleWords = () => {
    if (clip.transcript.length === 0) return [];
    if (activeWordIndex === -1) {
      // Find closest word
      const nextIdx = clip.transcript.findIndex((w) => w.start > currentTime);
      const center = nextIdx !== -1 ? Math.max(0, nextIdx - 1) : 0;
      return clip.transcript.slice(center, center + 2);
    }
    const start = Math.max(0, activeWordIndex - 1);
    return clip.transcript.slice(start, start + 3);
  };

  const visibleWords = getVisibleWords();

  // Dynamic zoom calculation
  const isImpactPhraseTime = zoomEffect && Math.floor(currentTime) % 6 < 2;

  // Filter CSS mapping
  const filterStyles: Record<string, string> = {
    none: '',
    clean: 'contrast(105%) brightness(102%) saturate(108%)',
    vibrant: 'contrast(115%) saturate(135%) brightness(105%)',
    cinematic: 'contrast(120%) saturate(85%) sepia(10%)',
    warm: 'contrast(108%) sepia(20%) saturate(115%)',
  };

  // Framing transform styling for 9:16 vertical conversion
  const getFramingStyle = () => {
    switch (framingMode) {
      case 'left':
        return { transform: 'scale(1.9) translateX(15%)', transformOrigin: 'center' };
      case 'right':
        return { transform: 'scale(1.9) translateX(-15%)', transformOrigin: 'center' };
      case 'split':
        return { transform: 'scale(1.6)', transformOrigin: 'center' };
      case 'center':
        return { transform: 'scale(1.85)', transformOrigin: 'center' };
      case 'auto':
      default:
        // Dynamic camera tracking simulation
        const panX = Math.sin(currentTime * 0.4) * 6;
        const scale = isImpactPhraseTime ? 2.05 : 1.88;
        return {
          transform: `scale(${scale}) translateX(${panX}%)`,
          transformOrigin: 'center center',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        };
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleApplyPreset = (presetKey: CaptionPreset) => {
    const preset = CAPTION_PRESETS[presetKey];
    setCaptionStyle(preset);
  };

  const handleCopyMeta = () => {
    const text = `${titleAi}\n\n${descriptionAi}\n\n${hashtagsAi.join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleRegenerateTitleAi = () => {
    const options = [
      'O SEGREDO QUE NINGUÉM TE CONTA SOBRE DISCIPLINA',
      'ISSO VAI MUDAR A SUA FORMA DE VER O DINHEIRO',
      'A MAIOR MENTIRA QUE VOCÊ APRENDEU NA ESCOLA',
      'COMO MULTIPLICAR SEU TEMPO EM 15 MINUTOS',
    ];
    const next = options[(options.indexOf(titleAi) + 1) % options.length] || options[0];
    setTitleAi(next);
  };

  const handleSaveChanges = () => {
    const updated: Clip = {
      ...clip,
      title: titleAi,
      titleAi,
      descriptionAi,
      hashtagsAi,
      filter: filter as any,
      speed,
      volume,
      zoomEffect,
      silenceRemoved,
      framingMode,
      captionStyle,
      dubbing,
    };
    onUpdateClip(updated);
  };

  const handleSyncSubtitlesWithDubbing = () => {
    const newTranscript = generateWordTimestamps(
      dubbing.portugueseText,
      clip.startTime,
      clip.endTime
    );
    const updated: Clip = {
      ...clip,
      transcript: newTranscript,
      fullText: dubbing.portugueseText,
      dubbing: {
        ...dubbing,
        translatedTranscript: newTranscript,
      },
    };
    onUpdateClip(updated);
  };

  const handleTestVoice = (voiceId: 'felipe' | 'camila' | 'rodrigo' | 'lucas') => {
    setIsTestingVoice(voiceId);
    const voice = DUBBING_VOICES.find((v) => v.id === voiceId);
    if (voice) {
      playDubbingSpeech(voice.sampleText, voiceId, dubbing.speechRate, 1.0, () => {
        setIsTestingVoice(null);
      });
    }
  };

  const handleTranslateOriginalAudio = async () => {
    setIsTranslating(true);
    setTranslationSuccess(false);

    try {
      const translated = await translateAudioWithAI(
        originalAudioText,
        sourceLang,
        translationTone
      );

      const newTranscript = generateWordTimestamps(
        translated,
        clip.startTime,
        clip.endTime
      );

      const updatedDubbing: DubbingConfig = {
        ...dubbing,
        enabled: true,
        portugueseText: translated,
        originalText: originalAudioText,
        sourceLanguage: sourceLang,
        tone: translationTone,
        translatedTranscript: newTranscript,
      };

      setDubbing(updatedDubbing);
      setTranslationSuccess(true);
      setTimeout(() => setTranslationSuccess(false), 3500);

      onUpdateClip({
        ...clip,
        fullText: translated,
        transcript: newTranscript,
        dubbing: updatedDubbing,
      });
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const clipProgressPct =
    ((currentTime - clip.startTime) / Math.max(1, clip.endTime - clip.startTime)) * 100;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title="Voltar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase">
                Editor 9:16 Vertical
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Score {clip.viralScore}/100
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
              {titleAi}
            </h1>
          </div>
        </div>

        {/* Action Buttons Top */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleSaveChanges}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            Salvar Alterações
          </button>

          <button
            onClick={() => onExport(clip)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-violet-600/30 hover:brightness-110 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>🚀 EXPORTAR PARA TIKTOK</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Left 9:16 Mobile Player / Right Inspector Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 9:16 VERTICAL SMART PLAYER (5 columns) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* Smartphone 9:16 Canvas Frame */}
          <div className="relative w-full max-w-[340px] aspect-[9/16] rounded-3xl overflow-hidden bg-black border-4 border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] select-none">
            {/* The Actual HTML5 Video Element */}
            <video
              ref={videoRef}
              src={videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{
                ...getFramingStyle(),
                filter: filterStyles[filter] || '',
              }}
              playsInline
              muted={isMuted}
            />

            {/* Click to play/pause overlay */}
            <div
              className="absolute inset-0 cursor-pointer z-10 flex items-center justify-center group"
              onClick={togglePlay}
            >
              {!isPlaying && (
                <div className="w-16 h-16 rounded-full bg-violet-600/80 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-110">
                  <Play className="w-8 h-8 fill-white ml-1" />
                </div>
              )}
            </div>

            {/* LIVE SYNCHRONIZED KARAOKE CAPTIONS */}
            <div
              className="absolute left-0 right-0 z-20 px-4 text-center pointer-events-none transition-all duration-100"
              style={{ top: `${captionStyle.positionY}%` }}
            >
              <div
                className={`inline-block px-3 py-1.5 rounded-lg transition-transform ${
                  captionStyle.hasBackground ? 'shadow-lg backdrop-blur-sm' : ''
                }`}
                style={{
                  backgroundColor: captionStyle.hasBackground
                    ? captionStyle.bgColor
                    : 'transparent',
                }}
              >
                <div
                  className="flex items-center justify-center flex-wrap gap-1.5 text-center leading-snug"
                  style={{
                    fontFamily: captionStyle.fontFamily,
                    fontSize: `${captionStyle.fontSize}px`,
                    textTransform: captionStyle.uppercase ? 'uppercase' : 'none',
                    fontWeight: 900,
                    letterSpacing: captionStyle.preset === 'podcast' ? '1px' : '-0.5px',
                  }}
                >
                  {visibleWords.map((wordObj, i) => {
                    const isWordActive =
                      currentTime >= wordObj.start && currentTime <= wordObj.end;

                    return (
                      <span
                        key={i}
                        className={`transition-all duration-100 ${
                          isWordActive
                            ? 'scale-115 drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]'
                            : 'opacity-90'
                        }`}
                        style={{
                          color: isWordActive
                            ? captionStyle.highlightColor
                            : captionStyle.textColor,
                          WebkitTextStroke: `${captionStyle.strokeWidth}px ${captionStyle.strokeColor}`,
                          paintOrder: 'stroke fill',
                          textShadow: `0 2px 8px rgba(0,0,0,0.8)`,
                        }}
                      >
                        {wordObj.word}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* TIKTOK / REELS / SHORTS SAFE AREA OVERLAY GUIDE */}
            {showSafeAreas && (
              <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 text-[10px] text-white/50 font-mono">
                {/* Top header safe area */}
                <div className="flex justify-between items-center opacity-60">
                  <span className="bg-black/40 px-2 py-0.5 rounded border border-white/10">
                    Seguindo | Para Você
                  </span>
                  <span className="bg-black/40 px-2 py-0.5 rounded border border-white/10">
                    🔍 Buscar
                  </span>
                </div>

                {/* Right side interaction buttons (Like, Comment, Save, Share) */}
                <div className="self-end space-y-4 mb-20 text-center opacity-70">
                  <div className="w-8 h-8 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-xs">
                    ❤️
                  </div>
                  <div className="w-8 h-8 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-xs">
                    💬
                  </div>
                  <div className="w-8 h-8 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-xs">
                    🔖
                  </div>
                  <div className="w-8 h-8 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-xs">
                    ↗️
                  </div>
                </div>

                {/* Bottom author & sound bar */}
                <div className="opacity-70 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 rounded">
                  <div className="font-bold text-white text-xs">@seucanal</div>
                  <div className="truncate text-[11px] text-slate-300">
                    {titleAi} · Som original
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Zoom Badge indicator */}
            {zoomEffect && isImpactPhraseTime && (
              <div className="absolute top-4 left-4 z-30 px-2 py-0.5 rounded bg-violet-600/90 text-white font-mono text-[9px] font-bold uppercase shadow-sm animate-pulse">
                Zoom IA 1.2x
              </div>
            )}

            {/* AI Dubbing Active Badge */}
            {dubbing.enabled && (
              <div className="absolute top-4 right-4 z-30 px-2.5 py-1 rounded-full bg-emerald-600/90 text-white font-mono text-[9px] font-bold uppercase shadow-lg flex items-center gap-1.5 backdrop-blur-sm border border-emerald-400/50">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>🇧🇷 Dublado (PT-BR)</span>
              </div>
            )}
          </div>

          {/* Quick Player Control Bar Under Phone */}
          <div className="w-full max-w-[340px] mt-3 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={togglePlay}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <button
                onClick={() => handleSeek(clip.startTime)}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                title="Reiniciar corte"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                title={isMuted ? 'Desmutar' : 'Mutar'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="font-mono text-xs text-cyan-400 font-semibold">
              {formatSeconds(currentTime)} / {formatSeconds(clip.endTime)}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Dubbing Quick Toggle Button */}
              <button
                onClick={() => {
                  const next = !dubbing.enabled;
                  setDubbing({ ...dubbing, enabled: next });
                  if (!next) stopDubbingSpeech();
                }}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  dubbing.enabled
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
                title="Alternar entre áudio original e dublagem em Português"
              >
                <span>🇧🇷</span>
                <span className="hidden sm:inline">{dubbing.enabled ? 'Dublado' : 'Original'}</span>
              </button>

              <button
                onClick={() => setShowSafeAreas(!showSafeAreas)}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  showSafeAreas
                    ? 'bg-violet-950/80 text-violet-300 border border-violet-800/40'
                    : 'bg-slate-900 text-slate-400'
                }`}
                title="Alternar Guia de Áreas Seguras do TikTok"
              >
                {showSafeAreas ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TIMELINE & EDITING INSPECTOR (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          {/* INTERACTIVE MULTI-TRACK TIMELINE */}
          <div className="editor-card rounded-2xl p-4 sm:p-5 bg-[#0d111d] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-violet-400" />
                Timeline Inteligente (Duração: {clip.duration}s)
              </span>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-slate-400">Início: <strong className="text-white">{formatSeconds(clip.startTime)}</strong></span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">Fim: <strong className="text-white">{formatSeconds(clip.endTime)}</strong></span>
              </div>
            </div>

            {/* Scrub track with audio waveform mock & silence flags */}
            <div className="relative w-full h-14 bg-slate-950 rounded-xl border border-slate-800 p-1 flex items-center select-none overflow-hidden">
              {/* Simulated Audio Waveform bars */}
              <div className="absolute inset-0 flex items-center justify-between px-2 opacity-40 pointer-events-none">
                {Array.from({ length: 48 }).map((_, idx) => {
                  const h = Math.sin(idx * 0.4) * 16 + 20;
                  const isSilenceZone = silenceRemoved && (idx > 10 && idx < 14);
                  return (
                    <div
                      key={idx}
                      className={`w-1 rounded-full ${
                        isSilenceZone ? 'bg-rose-500/60' : 'bg-cyan-400'
                      }`}
                      style={{ height: `${isSilenceZone ? 4 : h}px` }}
                    />
                  );
                })}
              </div>

              {/* Progress fill */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-violet-600/30 border-r-2 border-violet-400 transition-all duration-75 pointer-events-none"
                style={{ width: `${Math.min(100, Math.max(0, clipProgressPct))}%` }}
              />

              {/* Interactive Range Input overlay */}
              <input
                type="range"
                min={clip.startTime}
                max={clip.endTime}
                step={0.1}
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
            </div>

            {/* Timeline Action Quick Buttons */}
            <div className="flex items-center justify-between gap-2 pt-1 flex-wrap text-xs">
              <button
                onClick={() => setSilenceRemoved(!silenceRemoved)}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  silenceRemoved
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>{silenceRemoved ? '✓ Silêncios Removidos' : 'Remover Silêncios'}</span>
              </button>

              <button
                onClick={() => setZoomEffect(!zoomEffect)}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  zoomEffect
                    ? 'bg-violet-950 text-violet-300 border border-violet-800/50'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>{zoomEffect ? '✓ Zoom Dinâmico Ativo' : 'Ativar Zoom Dinâmico'}</span>
              </button>

              <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                {[1.0, 1.1, 1.25].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSpeed(s);
                      if (videoRef.current) videoRef.current.playbackRate = s;
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                      speed === s ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* INSPECTOR TABS BAR */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto">
            {[
              { id: 'dublagem', label: '🇧🇷 Dublagem PT-BR', icon: Music },
              { id: 'legendas', label: '📝 Legendas & Estilos', icon: Subtitles },
              { id: 'enquadramento', label: '📐 Reenquadrar 9:16', icon: Crop },
              { id: 'ia-texto', label: '🤖 Título & Hashtags IA', icon: Wand2 },
              { id: 'audio', label: '🎨 Filtros & Áudio', icon: Palette },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 0: DUBLAGEM EM PORTUGUÊS (IA) */}
          {activeTab === 'dublagem' && (
            <div className="editor-card rounded-2xl p-5 bg-[#0d111d] border border-slate-800 space-y-5 animate-in fade-in duration-200">
              {/* Header with Enable Switch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white flex items-center gap-1.5">
                      <span>🇧🇷</span> Dublagem Automática em Português
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                      IA v3.8 PT-BR
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Substitui ou sobrepõe o áudio original por uma voz natural brasileira com sincronia labial.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const next = !dubbing.enabled;
                    setDubbing({ ...dubbing, enabled: next });
                    if (!next) stopDubbingSpeech();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    dubbing.enabled
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {dubbing.enabled ? '✓ Dublagem Ativa' : 'Ativar Dublagem'}
                </button>
              </div>

              {/* SEÇÃO: TRADUÇÃO DE ÁUDIO ORIGINAL COM IA */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-3.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300">
                      <Languages className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        Tradutor de Áudio Original com IA
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Converta falas em outros idiomas (inglês, espanhol, etc.) em português natural adaptado para dublagem.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                    Sincronia Labial
                  </span>
                </div>

                {/* Language & Tone Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-cyan-400" />
                      Idioma Original do Vídeo:
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: 'en', label: '🇺🇸 Inglês' },
                        { id: 'es', label: '🇪🇸 Espanhol' },
                        { id: 'fr', label: '🇫🇷 Francês' },
                        { id: 'de', label: '🇩🇪 Alemão' },
                      ].map((lang) => (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => setSourceLang(lang.id as any)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            sourceLang === lang.id
                              ? 'border-indigo-400 bg-indigo-600/30 text-white shadow-sm'
                              : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:text-white'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Tom da Tradução para Dublagem:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'natural', label: '🎭 Fluido & Natural' },
                        { id: 'viral', label: '🔥 Viral TikTok' },
                        { id: 'formal', label: '💼 Educativo' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTranslationTone(t.id as any)}
                          className={`py-1.5 px-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                            translationTone === t.id
                              ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-sm'
                              : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:text-white'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Original Speech Textarea */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-300">Fala Original no Vídeo ({sourceLang.toUpperCase()}):</span>
                    <span className="text-slate-500 font-mono">Texto original transcrito</span>
                  </div>
                  <textarea
                    rows={2}
                    value={originalAudioText}
                    onChange={(e) => setOriginalAudioText(e.target.value)}
                    placeholder="Cole ou edite a transcrição do áudio original no idioma do vídeo..."
                    className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-200 focus:border-indigo-400 outline-none font-mono"
                  />
                </div>

                {/* Translate Action Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  {translationSuccess ? (
                    <div className="text-xs text-emerald-300 flex items-center gap-1.5 font-medium animate-in fade-in">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Áudio traduzido e adaptado! Legendas e dublagem PT-BR atualizadas.</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Adapta gírias, ritmo e cadência da fala para o português do Brasil.
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleTranslateOriginalAudio}
                    disabled={isTranslating}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
                  >
                    {isTranslating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Traduzindo com IA...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRightLeft className="w-4 h-4 text-cyan-300" />
                        <span>Traduzir Áudio Original com IA</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Voice Personas Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Escolha a Voz de IA em Português (Brasil)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DUBBING_VOICES.map((v) => {
                    const isSelected = dubbing.voiceId === v.id;
                    const isTesting = isTestingVoice === v.id;

                    return (
                      <div
                        key={v.id}
                        onClick={() => {
                          setDubbing({
                            ...dubbing,
                            voiceId: v.id,
                            voiceName: v.name,
                          });
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-950/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>🎙️</span> {v.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                              {v.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">{v.description}</p>
                        </div>

                        <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {v.gender === 'masculino' ? 'Voz Masculina' : 'Voz Feminina'}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestVoice(v.id);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-300 flex items-center gap-1 border border-slate-700 transition-colors"
                          >
                            <span>{isTesting ? '🔊 Falando...' : '🔊 Ouvir Amostra'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sliders: Audio Ducking & Speech Speed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                {/* Audio Ducking */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Áudio Original de Fundo (Audio Ducking)</span>
                    <span className="font-mono text-cyan-400">
                      {Math.round(dubbing.volumeDuck * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={1.0}
                    step={0.05}
                    value={dubbing.volumeDuck}
                    onChange={(e) =>
                      setDubbing({ ...dubbing, volumeDuck: parseFloat(e.target.value) })
                    }
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Abaixa a trilha original enquanto a voz em português fala com clareza.
                  </span>
                </div>

                {/* Speech Rate */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Velocidade da Voz em Português</span>
                    <span className="font-mono text-cyan-400">{dubbing.speechRate.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.85}
                    max={1.3}
                    step={0.05}
                    value={dubbing.speechRate}
                    onChange={(e) =>
                      setDubbing({ ...dubbing, speechRate: parseFloat(e.target.value) })
                    }
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Ajuste o ritmo para encaixar naturalmente com o tempo da cena.
                  </span>
                </div>
              </div>

              {/* Translated Script Editor */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Texto Dublado em Português (Editável)
                  </label>
                  <button
                    onClick={handleSyncSubtitlesWithDubbing}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Regera a sincronia das legendas com o texto editado"
                  >
                    <span>Sincronizar com as Legendas</span>
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={dubbing.portugueseText}
                  onChange={(e) => setDubbing({ ...dubbing, portugueseText: e.target.value })}
                  placeholder="Digite ou ajuste o texto da fala em português..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-200 focus:border-emerald-500 outline-none font-sans leading-relaxed"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{dubbing.portugueseText.split(/\s+/).filter(Boolean).length} palavras em PT-BR</span>
                  <span className="text-emerald-400">✓ Sincronia fonética ativada</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: LEGENDAS & ESTILOS */}
          {activeTab === 'legendas' && (
            <div className="editor-card rounded-2xl p-5 bg-[#0d111d] border border-slate-800 space-y-5 animate-in fade-in duration-200">
              {/* Presets Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Estilos de Legenda Prontos
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(
                    [
                      { id: 'viral', label: 'Viral 🔥' },
                      { id: 'minimal', label: 'Minimal ✨' },
                      { id: 'podcast', label: 'Podcast 🎙️' },
                      { id: 'gamer', label: 'Gamer 🎮' },
                      { id: 'premium', label: 'Premium 💎' },
                      { id: 'impact', label: 'Impacto ⚡' },
                    ] as const
                  ).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset.id)}
                      className={`p-2 rounded-xl text-center border text-xs font-bold transition-all cursor-pointer ${
                        captionStyle.preset === preset.id
                          ? 'border-violet-500 bg-violet-600/20 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption Customizers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                {/* Font Size Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Tamanho da Fonte</span>
                    <span className="font-mono text-cyan-400">{captionStyle.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={26}
                    value={captionStyle.fontSize}
                    onChange={(e) =>
                      setCaptionStyle({ ...captionStyle, fontSize: parseInt(e.target.value) })
                    }
                    className="w-full accent-violet-500 cursor-pointer"
                  />
                </div>

                {/* Vertical Position Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Posição Vertical</span>
                    <span className="font-mono text-cyan-400">{captionStyle.positionY}%</span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={85}
                    value={captionStyle.positionY}
                    onChange={(e) =>
                      setCaptionStyle({ ...captionStyle, positionY: parseInt(e.target.value) })
                    }
                    className="w-full accent-violet-500 cursor-pointer"
                  />
                </div>

                {/* Text Color & Highlight Color */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs text-slate-400 block">Cor do Texto</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={captionStyle.textColor}
                        onChange={(e) =>
                          setCaptionStyle({ ...captionStyle, textColor: e.target.value })
                        }
                        className="w-8 h-8 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-xs text-slate-300">
                        {captionStyle.textColor}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="text-xs text-slate-400 block">Destaque (Highlight)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={captionStyle.highlightColor}
                        onChange={(e) =>
                          setCaptionStyle({ ...captionStyle, highlightColor: e.target.value })
                        }
                        className="w-8 h-8 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-xs text-emerald-400">
                        {captionStyle.highlightColor}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Uppercase & Background Toggle */}
                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={captionStyle.uppercase}
                      onChange={(e) =>
                        setCaptionStyle({ ...captionStyle, uppercase: e.target.checked })
                      }
                      className="rounded accent-violet-500 w-4 h-4 cursor-pointer"
                    />
                    <span>CAIXA ALTA (Caps)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={captionStyle.hasBackground}
                      onChange={(e) =>
                        setCaptionStyle({ ...captionStyle, hasBackground: e.target.checked })
                      }
                      className="rounded accent-violet-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Fundo Escuro</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REENQUADRAR 9:16 */}
          {activeTab === 'enquadramento' && (
            <div className="editor-card rounded-2xl p-5 bg-[#0d111d] border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">
                  Enquadramento Automático com Detecção Facial
                </h3>
                <p className="text-xs text-slate-400">
                  O sistema recorta o vídeo horizontal 16:9 para o formato vertical 9:16 mantendo o orador centralizado.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {[
                  {
                    id: 'auto',
                    title: 'Auto Rastreamento',
                    desc: 'Segue quem fala dinamicamente',
                  },
                  {
                    id: 'center',
                    title: 'Centro Fixo',
                    desc: 'Foco centralizado no meio',
                  },
                  {
                    id: 'left',
                    title: 'Orador à Esquerda',
                    desc: 'Enquadra participante da esquerda',
                  },
                  {
                    id: 'right',
                    title: 'Orador à Direita',
                    desc: 'Enquadra participante da direita',
                  },
                  {
                    id: 'split',
                    title: 'Split Multi-Speaker',
                    desc: 'Visão composta para podcasts',
                  },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setFramingMode(mode.id as any)}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      framingMode === mode.id
                        ? 'border-cyan-400 bg-cyan-950/40 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-white mb-0.5">{mode.title}</div>
                    <div className="text-[10px] text-slate-400 leading-snug">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: IA PARA TÍTULO & HASHTAGS */}
          {activeTab === 'ia-texto' && (
            <div className="editor-card rounded-2xl p-5 bg-[#0d111d] border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Copywriting Otimizado para TikTok & Reels
                  </h3>
                  <p className="text-xs text-slate-400">
                    Títulos chamativos, descrição e hashtags gerados pela IA com base na transcrição.
                  </p>
                </div>
                <button
                  onClick={handleRegenerateTitleAi}
                  className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                  title="Gerar outra variação de título"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Variação</span>
                </button>
              </div>

              {/* Title Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">
                  Título Sugerido (Chamativo & Curto)
                </label>
                <input
                  type="text"
                  value={titleAi}
                  onChange={(e) => setTitleAi(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:border-violet-500 outline-none"
                />
              </div>

              {/* Description Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">
                  Descrição do Post (TikTok / Reels)
                </label>
                <textarea
                  rows={2}
                  value={descriptionAi}
                  onChange={(e) => setDescriptionAi(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:border-violet-500 outline-none"
                />
              </div>

              {/* Hashtags */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase">
                  Hashtags Estratégicas
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {hashtagsAi.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-violet-950/70 border border-violet-800/40 text-violet-300 font-mono text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleCopyMeta}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado para postar!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Título, Legenda e Tags</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: FILTROS & ÁUDIO */}
          {activeTab === 'audio' && (
            <div className="editor-card rounded-2xl p-5 bg-[#0d111d] border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Graduação de Cor e Filtros Cinematográficos</h3>
                <p className="text-xs text-slate-400">Realce a imagem do seu vídeo com 1 clique.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {[
                  { id: 'none', label: 'Original' },
                  { id: 'clean', label: 'Clean Studio' },
                  { id: 'vibrant', label: 'Vibrante 🔥' },
                  { id: 'cinematic', label: 'Cinemático 🎬' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id as any)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      filter === f.id
                        ? 'border-violet-500 bg-violet-600/20 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Volume & Normalização de Áudio</span>
                  <span className="font-mono text-cyan-400">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1.5}
                  step={0.05}
                  value={volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    if (videoRef.current) videoRef.current.volume = Math.min(1, v);
                  }}
                  className="w-full accent-violet-500 cursor-pointer"
                />
                <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-mono">
                  <span>✓ Redução de ruído e compressor de voz ativos</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
