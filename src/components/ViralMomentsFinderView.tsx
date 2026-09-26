import React, { useState } from 'react';
import {
  Flame,
  Scissors,
  Sparkles,
  Zap,
  TrendingUp,
  MessageSquareQuote,
  Clock,
  Play,
  Share2,
  Check,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Clip, Project } from '../types/editor';

interface ViralMomentsFinderViewProps {
  project: Project;
  onSelectClipToEdit: (clip: Clip) => void;
  onBackToDashboard: () => void;
}

export const ViralMomentsFinderView: React.FC<ViralMomentsFinderViewProps> = ({
  project,
  onSelectClipToEdit,
  onBackToDashboard,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleShare = (clip: Clip) => {
    const text = `Confira esse corte viral: "${clip.title}" (${clip.viralScore}/100 de potencial) gerado pelo CUTS AI PRO!`;
    navigator.clipboard.writeText(text);
    setCopiedId(clip.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-amber-950/40 via-[#0f1423] to-[#0f1423] border border-amber-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>RADAR DE MOMENTOS VIRAIS POR IA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
              Ganchos e Trechos com Alto Potencial de Viralização
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              O motor de IA analisou a fala, mudanças de assunto, conflitos e entonações emocionais do vídeo "<strong>{project.name}</strong>". Estes são os trechos com maior chance de recomendação algorítmica no TikTok, Reels e Shorts.
            </p>
          </div>

          <button
            onClick={onBackToDashboard}
            className="self-start md:self-center px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            Filtrar ganchos:
          </span>
          {[
            { id: 'all', label: 'Todos os Momentos' },
            { id: 'hook', label: 'Ganchos Fortes (0-3s)' },
            { id: 'curiosity', label: 'Quebra de Padrão' },
            { id: 'short', label: 'Rápidos (≤30s)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-slate-400 font-mono text-[11px] shrink-0">
          {project.clips.length} momentos identificados
        </span>
      </div>

      {/* Viral Moments List */}
      <div className="space-y-4">
        {project.clips.map((clip, index) => {
          return (
            <div
              key={clip.id}
              className="editor-card rounded-2xl p-5 sm:p-6 bg-[#0d1220] border border-slate-800/90 hover:border-amber-500/40 relative overflow-hidden transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left block: Moment number & timestamp */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-black text-amber-400 font-display flex items-center gap-1.5">
                      <Flame className="w-4 h-4 fill-amber-400" />
                      Momento #{index + 1}
                    </span>

                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-950 text-cyan-300 border border-cyan-800/40 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatSeconds(clip.startTime)} → {formatSeconds(clip.endTime)}
                      <span className="text-slate-400">({clip.duration}s)</span>
                    </span>

                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Score Viral: {clip.viralScore}/100
                    </span>

                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-violet-950/70 text-violet-300 border border-violet-800/40">
                      {clip.viralTag}
                    </span>
                  </div>

                  {/* Title & Preview Text */}
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white mb-1.5">
                      {clip.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 italic border-l-2 border-amber-500/50 pl-3 py-0.5 leading-relaxed bg-slate-950/40 rounded-r">
                      "{clip.fullText}"
                    </p>
                  </div>

                  {/* Why this cut was chosen by AI */}
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/25 space-y-1">
                    <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Por que este corte foi selecionado pela IA:
                    </div>
                    <p className="text-xs text-amber-100/90 leading-relaxed">
                      {clip.whyViral}
                    </p>
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {clip.viralityHooks.map((hook, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-semibold text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700/60"
                        >
                          ✓ {hook}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right block: Action buttons */}
                <div className="flex lg:flex-col items-center gap-2.5 shrink-0 self-stretch justify-end">
                  <button
                    onClick={() => onSelectClipToEdit(clip)}
                    className="flex-1 lg:w-48 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer glow-viral"
                  >
                    <Scissors className="w-4 h-4 fill-slate-950" />
                    <span>✂️ CRIAR CORTE</span>
                  </button>

                  <button
                    onClick={() => handleShare(clip)}
                    className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                    title="Copiar dados da análise"
                  >
                    {copiedId === clip.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="hidden sm:inline text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Compartilhar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
