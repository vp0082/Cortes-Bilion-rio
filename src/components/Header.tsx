import React from 'react';
import { ShieldCheck, Volume2, VolumeX, Sparkles, Terminal } from 'lucide-react';
import { playTechClick } from '../utils/audio';

interface HeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenInfoModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMuted,
  onToggleMute,
  onOpenInfoModal,
}) => {
  return (
    <header className="relative z-20 border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-600/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase">
                Sistema Demonstrativo
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>CONSULTA DE VALORES</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/30">
                DEMONSTRAÇÃO
              </span>
            </h1>
          </div>
        </div>

        {/* Right side status & controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Security status text */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 border border-slate-800/80 bg-slate-900/60 rounded-lg px-3 py-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Processamento 100% Local</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Sem envio de dados</span>
          </div>

          {/* Info / Architecture modal button */}
          {onOpenInfoModal && (
            <button
              onClick={() => {
                playTechClick();
                onOpenInfoModal();
              }}
              title="Informações da Arquitetura e Simulação"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/60 hover:border-cyan-500/40 rounded-lg transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Arquitetura</span>
            </button>
          )}

          {/* Sound toggle button */}
          <button
            onClick={() => {
              playTechClick();
              onToggleMute();
            }}
            aria-label={isMuted ? 'Ativar sons futuristas' : 'Desativar sons futuristas'}
            title={isMuted ? 'Ativar áudio' : 'Silenciar áudio'}
            className="p-2 text-slate-400 hover:text-cyan-300 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/60 hover:border-cyan-500/40 rounded-lg transition-colors cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
