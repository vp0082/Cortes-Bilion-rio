import React, { useState } from 'react';
import { Subtitles, Sparkles, Check, Palette, Type, Sliders } from 'lucide-react';
import { CaptionPreset, CaptionStyleConfig } from '../types/editor';
import { CAPTION_PRESETS } from '../services/sampleData';

export const SubtitlesView: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<CaptionPreset>('viral');
  const [activeWordIdx, setActiveWordIdx] = useState(2);

  const presetsList: Array<{ id: CaptionPreset; name: string; tag: string; desc: string }> = [
    {
      id: 'viral',
      name: 'Viral Hormozi / MrBeast 🔥',
      tag: 'Mais Usado no TikTok',
      desc: 'Letras amarelas com destaque verde neon e contorno preto espesso para leitura instantânea.',
    },
    {
      id: 'minimal',
      name: 'Minimalista Clean ✨',
      tag: 'Reels e Stories',
      desc: 'Tipografia sóbria, branca com leve fundo translúcido para conteúdo corporativo e estético.',
    },
    {
      id: 'podcast',
      name: 'Podcast Pro 🎙️',
      tag: 'YouTube Shorts e Entrevistas',
      desc: 'Caixa alta condensada estilo Bebas Neue com destaque laranja energético.',
    },
    {
      id: 'gamer',
      name: 'Gamer Cyberpunk 🎮',
      tag: 'Twitch e Streaming',
      desc: 'Neon ciano futurista com contorno roxo para cortes de jogos e tech.',
    },
    {
      id: 'premium',
      name: 'Premium & Luxo 💎',
      tag: 'Finanças e Negócios',
      desc: 'Dourado sofisticado com fundo escuro aveludado para alto valor percebido.',
    },
    {
      id: 'impact',
      name: 'Impacto Máximo ⚡',
      tag: 'Hooks Agressivos',
      desc: 'Vermelho vibrante com animação de pulso para frases de virada de chave.',
    },
  ];

  const currentConfig: CaptionStyleConfig = CAPTION_PRESETS[selectedPreset];
  const sampleWords = ['ESTE', 'É', 'O', 'SEGREDO', 'DO', 'SUCESSO'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2 font-display">
          <Subtitles className="w-5 h-5 text-violet-400" />
          Estilos de Legendas Automáticas
        </h1>
        <p className="text-xs text-slate-400">
          Legendas animadas palavra por palavra sincronizadas com a fala pelo motor de IA.
        </p>
      </div>

      {/* Live Preview Box */}
      <div className="rounded-3xl p-8 bg-gradient-to-b from-[#0f1424] to-[#0a0d18] border border-violet-500/30 text-center relative overflow-hidden shadow-2xl">
        <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-4">
          Demonstração do Estilo Sincronizado
        </div>

        <div className="py-6 flex items-center justify-center">
          <div
            className={`inline-block px-4 py-2 rounded-xl transition-all ${
              currentConfig.hasBackground ? 'shadow-2xl' : ''
            }`}
            style={{
              backgroundColor: currentConfig.hasBackground ? currentConfig.bgColor : 'transparent',
            }}
          >
            <div
              className="flex items-center gap-2 text-2xl sm:text-4xl font-black"
              style={{
                fontFamily: currentConfig.fontFamily,
                textTransform: currentConfig.uppercase ? 'uppercase' : 'none',
              }}
            >
              {sampleWords.map((word, i) => {
                const isActive = i === activeWordIdx;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveWordIdx(i)}
                    className="transition-all cursor-pointer focus:outline-none"
                    style={{
                      color: isActive ? currentConfig.highlightColor : currentConfig.textColor,
                      WebkitTextStroke: `${currentConfig.strokeWidth}px ${currentConfig.strokeColor}`,
                      paintOrder: 'stroke fill',
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-mono">
          Clique nas palavras para simular o efeito de destaque por voz em tempo real
        </p>
      </div>

      {/* Preset cards selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presetsList.map((preset) => {
          const isSelected = selectedPreset === preset.id;
          return (
            <div
              key={preset.id}
              onClick={() => setSelectedPreset(preset.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-violet-950/30 border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                  : 'bg-[#0d111d] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">{preset.name}</span>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-white">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800 inline-block mb-2">
                {preset.tag}
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">{preset.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
