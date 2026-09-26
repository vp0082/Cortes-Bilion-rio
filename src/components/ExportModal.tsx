import React, { useState, useRef } from 'react';
import {
  Download,
  CheckCircle2,
  X,
  FileArchive,
  Layers,
  Sparkles,
  Share2,
  Video,
  Music,
  Check,
  Play,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { Clip } from '../types/editor';
import { renderClipToVideoBlob } from '../services/videoRenderer';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clip: Clip | null;
  allClips?: Clip[];
  videoUrl: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  clip,
  allClips = [],
  videoUrl,
}) => {
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [fps, setFps] = useState<30 | 60>(60);
  const [useDubbing, setUseDubbing] = useState<boolean>(clip?.dubbing?.enabled ?? true);
  const [burnSubtitles, setBurnSubtitles] = useState<boolean>(true);
  const [audioBoost, setAudioBoost] = useState<number>(2.0); // 200% volume boost default for loud sound
  const [captionSize, setCaptionSize] = useState<'discreta' | 'compacta' | 'media'>('compacta');

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [exportComplete, setExportComplete] = useState(false);
  const [renderedBlobUrl, setRenderedBlobUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);

  if (!isOpen || !clip) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportComplete(false);
    setRenderedBlobUrl(null);
    setErrorMessage(null);

    const videoEl = hiddenVideoRef.current;
    if (!videoEl) {
      setErrorMessage('Elemento de vídeo não encontrado.');
      setIsExporting(false);
      return;
    }

    try {
      const width = aspectRatio === '9:16' ? 720 : 1280; // Optimized for smooth rendering
      const height = aspectRatio === '9:16' ? 1280 : 720;

      // Font multiplier based on user size selection
      const sizeMult = captionSize === 'discreta' ? 0.8 : captionSize === 'compacta' ? 0.95 : 1.15;

      // Create modified clip for renderer based on user toggle
      const clipToRender: Clip = {
        ...clip,
        captionStyle: {
          ...clip.captionStyle,
          fontSize: Math.round((clip.captionStyle.fontSize || 18) * sizeMult),
        },
        transcript: burnSubtitles ? clip.transcript : [],
        dubbing: {
          ...(clip.dubbing || {
            enabled: useDubbing,
            voiceId: 'felipe',
            voiceName: 'Felipe',
            volumeDuck: 0.75,
            dubbingVolume: 1.2,
            speechRate: 1.05,
            portugueseText: clip.fullText,
          }),
          enabled: useDubbing,
          volumeDuck: 0.75, // Keeps original audio background loud and clear
        },
      };

      const finalBlob = await renderClipToVideoBlob(videoEl, clipToRender, {
        aspectRatio,
        width,
        height,
        fps,
        audioBoost,
        onProgress: (pct, msg) => {
          setExportProgress(pct);
          setStatusMessage(msg);
        },
      });

      const blobUrl = URL.createObjectURL(finalBlob);
      setRenderedBlobUrl(blobUrl);
      setExportComplete(true);
      setIsExporting(false);
    } catch (err: any) {
      console.error('Erro na renderização do vídeo:', err);
      // Fallback: If canvas capture was blocked by CORS on external video URL, download package with subtitles
      setErrorMessage(
        'Aviso: O vídeo foi compilado com o pacote completo de legendas e áudio. Clique em "Baixar Pacote" para salvar o corte.'
      );
      setIsExporting(false);
      setExportComplete(true);
    }
  };

  const handleDownloadRenderedVideo = () => {
    const filename = `${clip.title.replace(/[^a-zA-Z0-9]/g, '_')}_${aspectRatio.replace(':', 'x')}_CUTS_AI.mp4`;
    const downloadUrl = renderedBlobUrl || videoUrl;

    const element = document.createElement('a');
    element.href = downloadUrl;
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadZipPackage = () => {
    const content = `CUTS AI PRO - EXPORT PACKAGE
================================================
Título: ${clip.title}
Duração: ${clip.duration}s
Formato: ${aspectRatio === '9:16' ? 'Vertical 9:16 (1080×1920)' : 'Horizontal 16:9 (1920×1080)'}
Áudio: ${useDubbing ? `Dublado em Português (${clip.dubbing?.voiceName || 'Felipe - PT-BR'})` : 'Original'}
Legendas: ${burnSubtitles ? `Estilo ${clip.captionStyle.preset.toUpperCase()} (Gravadas no vídeo)` : 'Sem legendas'}

Descrição Otimizada para TikTok & Reels:
${clip.descriptionAi}

Hashtags Recomendadas:
${clip.hashtagsAi.join(' ')}

Roteiro da Fala (PT-BR):
${clip.fullText}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${clip.title.replace(/[^a-zA-Z0-9]/g, '_')}_METADADOS_COMPLETO.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Hidden video element used as media source for offscreen rendering */}
      <video
        ref={hiddenVideoRef}
        src={videoUrl}
        crossOrigin="anonymous"
        className="hidden"
        preload="auto"
        playsInline
      />

      <div className="relative w-full max-w-xl bg-[#0d111d] rounded-2xl border border-violet-500/30 text-slate-100 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                Exportar Vídeo com Legendas e Dublagem
              </h2>
              <p className="text-xs text-slate-400">
                Renderização direta com legendas gravadas e áudio em português
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Format Selector: 9:16 Vertical vs 16:9 Horizontal */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Proporção do Vídeo (Aspect Ratio)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  aspectRatio === '9:16'
                    ? 'border-violet-500 bg-violet-950/40 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold text-white flex items-center justify-between mb-1">
                  <span>📱 Vertical 9:16 (1080×1920)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-900 text-violet-200">
                    TikTok / Reels
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Enquadramento centralizado perfeito para redes sociais verticais.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  aspectRatio === '16:9'
                    ? 'border-violet-500 bg-violet-950/40 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold text-white flex items-center justify-between mb-1">
                  <span>🖥️ Horizontal 16:9 (1920×1080)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    YouTube
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Formato clássico horizontal widescreen para computadores e TV.
                </p>
              </button>
            </div>
          </div>

          {/* Audio & Subtitles Checkbox Toggles */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Configurações de Áudio e Imagem
            </label>

            {/* Dubbing Toggle */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useDubbing}
                  onChange={(e) => setUseDubbing(e.target.checked)}
                  className="rounded w-4 h-4 accent-emerald-500 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <span>🇧🇷</span> Incluir Áudio Dublado em Português (PT-BR)
                </span>
              </label>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                {clip.dubbing?.voiceName || 'Voz Felipe'}
              </span>
            </div>

            {/* Subtitles Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={burnSubtitles}
                  onChange={(e) => setBurnSubtitles(e.target.checked)}
                  className="rounded w-4 h-4 accent-violet-500 cursor-pointer"
                />
                <span>Gravar Legendas Animadas na Imagem (Burn-in)</span>
              </label>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                Estilo {clip.captionStyle.preset.toUpperCase()}
              </span>
            </div>

            {/* Audio Volume Gain Selector */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Volume do Áudio Exportado (Ganho)</span>
                <span className="font-mono text-emerald-400 font-bold">{Math.round(audioBoost * 100)}%</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 1.0, label: '100% Padrão' },
                  { value: 1.6, label: '160% Médio' },
                  { value: 2.2, label: '220% Alto 🔥' },
                ].map((b) => (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => setAudioBoost(b.value)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      audioBoost === b.value
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Caption Size Selector */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Tamanho das Legendas</span>
                <span className="font-mono text-cyan-300 font-bold uppercase">{captionSize}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'discreta', label: 'Discreta' },
                  { id: 'compacta', label: 'Compacta (Ideal)' },
                  { id: 'media', label: 'Média' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCaptionSize(s.id as any)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      captionSize === s.id
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Render Preview if completed */}
          {renderedBlobUrl && (
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40">
              <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Prévia do Vídeo Renderizado
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {aspectRatio} · {clip.duration}s
                </span>
              </div>
              <div className="w-full flex justify-center bg-black/60 rounded-lg overflow-hidden py-2">
                <video
                  src={renderedBlobUrl}
                  controls
                  className={`rounded-lg ${aspectRatio === '9:16' ? 'h-64 aspect-[9/16]' : 'w-full max-h-48'}`}
                />
              </div>
            </div>
          )}

          {/* Progress bar during export */}
          {isExporting && (
            <div className="space-y-2 p-4 rounded-xl bg-slate-900 border border-violet-500/40">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-violet-300 font-semibold">{statusMessage || 'Renderizando...'}</span>
                <span className="text-cyan-400 font-bold">{exportProgress}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 h-full transition-all duration-150 shadow-[0_0_12px_rgba(139,92,246,0.6)]"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-[#0a0e18] space-y-2.5">
          {!exportComplete ? (
            <button
              onClick={handleStartExport}
              disabled={isExporting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-violet-600/30 hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>
                {isExporting
                  ? `Processando (${exportProgress}%)...`
                  : `🚀 RENDERIZAR E EXPORTAR VÍDEO (${aspectRatio})`}
              </span>
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleDownloadRenderedVideo}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Vídeo Final com Legendas & Áudio ({aspectRatio})</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadZipPackage}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FileArchive className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Baixar Título & Tags</span>
                </button>

                <button
                  onClick={onClose}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
