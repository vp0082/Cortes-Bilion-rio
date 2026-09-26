import React, { useState } from 'react';
import {
  Bot,
  Cpu,
  Sliders,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  Share2,
  HardDrive,
} from 'lucide-react';

export const AiSettingsView: React.FC = () => {
  const [model, setModel] = useState('gemini-3.8-flash');
  const [sensitivity, setSensitivity] = useState<'alta' | 'balanceada' | 'conservadora'>('alta');
  const [silenceThreshold, setSilenceThreshold] = useState(0.6);
  const [autoZoom, setAutoZoom] = useState(true);
  const [autoFraming, setAutoFraming] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2 font-display">
          <Bot className="w-5 h-5 text-violet-400" />
          Configurações do Motor de IA & Algoritmo Viral
        </h1>
        <p className="text-xs text-slate-400">
          Ajuste como a inteligência artificial analisa ganchos, silêncios e enquadramento vertical.
        </p>
      </div>

      <div className="space-y-4">
        {/* Model Card */}
        <div className="editor-card rounded-2xl p-5 bg-[#0d111d] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Modelo de Linguagem e Visão Computacional
              </h3>
              <p className="text-xs text-slate-400">
                Processador de alta velocidade para transcrição e detecção de retenção.
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
              Conectado
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              {
                id: 'gemini-3.8-flash',
                name: 'Gemini 3.8 Flash (Padrão Recomendado)',
                desc: 'Ultra rápido, baixa latência e precisão em português para ganchos virais.',
              },
              {
                id: 'gemini-3.1-pro',
                name: 'Gemini 3.1 Pro (Análise Profunda)',
                desc: 'Maior capacidade de raciocínio para debates complexos e aulas técnicas.',
              },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setModel(m.id)}
                className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                  model === m.id
                    ? 'border-violet-500 bg-violet-950/40 text-white'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold text-white mb-0.5">{m.name}</div>
                <div className="text-[11px] text-slate-400">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Virality Sensitivity */}
        <div className="editor-card rounded-2xl p-5 bg-[#0d111d] border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Sensibilidade de Detecção Viral
          </h3>
          <p className="text-xs text-slate-400">
            Define o quão exigente a IA deve ser ao pontuar e selecionar momentos como virais.
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'alta', label: 'Alta (Gera Mais Cortes)', desc: 'Prioriza volume para TikTok' },
              { id: 'balanceada', label: 'Balanceada', desc: 'Equilíbrio perfeito' },
              { id: 'conservadora', label: 'Conservadora (Ultra Exigente)', desc: 'Apenas picos absolutos' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSensitivity(s.id as any)}
                className={`p-3 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                  sensitivity === s.id
                    ? 'border-amber-500 bg-amber-950/30 text-white'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-white mb-0.5">{s.label}</div>
                <div className="text-[10px] text-slate-400 font-normal">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Silence & Auto Zoom Toggles */}
        <div className="editor-card rounded-2xl p-5 bg-[#0d111d] border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-violet-400" />
            Automações de Edição
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Limiar de Corte de Silêncio</span>
                <span className="text-slate-400 text-[11px]">
                  Pausas acima deste valor serão removidas automaticamente para acelerar o ritmo.
                </span>
              </div>
              <span className="font-mono text-cyan-400 font-bold">{silenceThreshold}s</span>
            </div>
            <input
              type="range"
              min={0.3}
              max={1.5}
              step={0.1}
              value={silenceThreshold}
              onChange={(e) => setSilenceThreshold(parseFloat(e.target.value))}
              className="w-full accent-violet-500 cursor-pointer"
            />

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Zoom Dinâmico Automático</span>
                <span className="text-slate-400 text-[11px]">
                  Aplica leves aproximações de 1.15x em frases de alto impacto.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoZoom}
                onChange={(e) => setAutoZoom(e.target.checked)}
                className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Auto-Framing 9:16 Inteligente</span>
                <span className="text-slate-400 text-[11px]">
                  Rastreia e centraliza o rosto de quem está falando no vídeo vertical.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoFraming}
                onChange={(e) => setAutoFraming(e.target.checked)}
                className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Configurações Salvas</span>
              </>
            ) : (
              <span>Salvar Preferências</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
