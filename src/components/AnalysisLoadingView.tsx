import React from 'react';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Layers,
  Volume2,
  Flame,
  Activity,
} from 'lucide-react';

interface AnalysisLoadingViewProps {
  progress: number;
  stepMessage: string;
  videoName: string;
}

const STEPS = [
  { id: 1, label: 'Transcrição e alinhamento de fala (Whisper/Gemini)', min: 0 },
  { id: 2, label: 'Detecção de mudanças de assunto e emoções', min: 20 },
  { id: 3, label: 'Identificação de risadas e perguntas & respostas', min: 40 },
  { id: 4, label: 'Cálculo de score viral e retenção de público', min: 60 },
  { id: 5, label: 'Mapeamento de silêncios e cortes automáticos', min: 75 },
  { id: 6, label: 'Enquadramento 9:16 e sincronização de legendas', min: 90 },
];

export const AnalysisLoadingView: React.FC<AnalysisLoadingViewProps> = ({
  progress,
  stepMessage,
  videoName,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070912]/95 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl bg-[#0c101c] rounded-3xl p-6 sm:p-10 border border-violet-500/30 text-center shadow-[0_0_80px_rgba(139,92,246,0.2)] overflow-hidden">
        {/* Glow ambient background elements */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top AI badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-300 text-xs font-mono mb-6">
          <BrainCircuit className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>MOTOR DE IA ANALISANDO VÍDEO</span>
        </div>

        {/* Circular Scanning Radar with pulse */}
        <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-violet-500/30 animate-spin [animation-duration:12s]" />
          <div className="absolute inset-2 rounded-full border border-cyan-500/30 animate-spin [animation-duration:6s] [animation-direction:reverse]" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-violet-600/20 to-cyan-500/20 animate-pulse-ring" />

          <div className="relative z-10 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white font-display">
              {Math.floor(progress)}%
            </span>
            <span className="text-[10px] text-cyan-300 font-mono">IA ATIVA</span>
          </div>
        </div>

        {/* Video & Current Status Title */}
        <h2 className="text-lg sm:text-xl font-bold text-white mb-1 font-display">
          Analisando "{videoName}"
        </h2>
        <p className="text-xs sm:text-sm text-cyan-300 font-mono mb-6 min-h-[20px]">
          {stepMessage}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800 mb-6">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(139,92,246,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Live Checklist */}
        <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800/80 text-left space-y-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Pipeline de Processamento</span>
            <span className="text-emerald-400 text-[10px] flex items-center gap-1 font-mono">
              <Activity className="w-3 h-3" /> Em tempo real
            </span>
          </div>

          {STEPS.map((step) => {
            const isDone = progress >= step.min + 15;
            const isCurrent = progress >= step.min && progress < step.min + 15;

            return (
              <div
                key={step.id}
                className="flex items-center gap-2.5 text-xs transition-colors"
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                )}

                <span
                  className={
                    isDone
                      ? 'text-slate-300'
                      : isCurrent
                      ? 'text-cyan-300 font-medium'
                      : 'text-slate-400'
                  }
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
