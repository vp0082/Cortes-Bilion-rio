import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileVideo,
  Sparkles,
  X,
  Play,
  CheckCircle2,
  Clock,
  Settings2,
  Zap,
} from 'lucide-react';
import { CaptionPreset } from '../types/editor';
import { SAMPLE_VIDEO_URL } from '../services/sampleData';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitVideo: (params: {
    file?: File;
    name: string;
    url: string;
    duration: number;
    resolution: string;
    fileSizeFormatted: string;
    targetDurations: number[];
    captionStyle: CaptionPreset;
  }) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSubmitVideo,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>(SAMPLE_VIDEO_URL);
  const [videoDuration, setVideoDuration] = useState<number>(184);
  const [videoResolution, setVideoResolution] = useState<string>('1920x1080 (16:9)');
  const [fileSizeStr, setFileSizeStr] = useState<string>('142.8 MB');
  const [videoName, setVideoName] = useState<string>('Podcast_Tech_Entrevista_4K.mp4');

  const [selectedDurations, setSelectedDurations] = useState<number[]>([15, 30, 45, 60]);
  const [captionPreset, setCaptionPreset] = useState<CaptionPreset>('viral');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setVideoName(file.name);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setFileSizeStr(`${sizeMb} MB`);

    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);

    // Read video duration and resolution via hidden video element
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = objectUrl;
    tempVideo.onloadedmetadata = () => {
      setVideoDuration(Math.round(tempVideo.duration) || 120);
      setVideoResolution(`${tempVideo.videoWidth || 1920}x${tempVideo.videoHeight || 1080}`);
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const toggleDuration = (sec: number) => {
    if (selectedDurations.includes(sec)) {
      if (selectedDurations.length > 1) {
        setSelectedDurations(selectedDurations.filter((d) => d !== sec));
      }
    } else {
      setSelectedDurations([...selectedDurations, sec].sort((a, b) => a - b));
    }
  };

  const handleStartAnalysis = () => {
    onSubmitVideo({
      file: selectedFile || undefined,
      name: videoName,
      url: videoPreviewUrl,
      duration: videoDuration,
      resolution: videoResolution,
      fileSizeFormatted: fileSizeStr,
      targetDurations: selectedDurations,
      captionStyle: captionPreset,
    });
  };

  const handleUseDemoVideo = () => {
    setSelectedFile(null);
    setVideoPreviewUrl(SAMPLE_VIDEO_URL);
    setVideoName('Entrevista_Inovacao_Ep42.mp4');
    setVideoDuration(184);
    setVideoResolution('1920x1080 (16:9)');
    setFileSizeStr('142.8 MB');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0d111d] rounded-2xl border border-violet-500/30 text-slate-100 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                Enviar Vídeo para Análise com IA
              </h2>
              <p className="text-xs text-slate-400">
                Detecção automática de melhores momentos para TikTok, Reels e Shorts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* File Upload Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-violet-400 bg-violet-950/30'
                : 'border-slate-700 hover:border-violet-500/60 bg-slate-900/40 hover:bg-slate-900/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp4,.mov,.mkv,.avi,video/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 p-0.5 mb-4 shadow-[0_0_25px_rgba(139,92,246,0.3)]">
              <div className="w-full h-full bg-[#0d111d] rounded-[14px] flex items-center justify-center">
                <UploadCloud className="w-8 h-8 text-violet-400 animate-bounce" />
              </div>
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Arraste e solte seu vídeo longo aqui
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3">
              Suporte completo a <strong>MP4, MOV, MKV e AVI</strong> até 4K 60FPS.
            </p>

            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              📤 Enviar vídeo do computador
            </button>
          </div>

          {/* Quick Demo Video alternative */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                <Play className="w-4 h-4 fill-cyan-400" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Prefere testar sem fazer upload?</div>
                <div className="text-[11px] text-slate-400">Use nosso podcast sample com falas e emoções já calibradas.</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleUseDemoVideo}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Usar Vídeo Demo
            </button>
          </div>

          {/* Selected Video Info Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileVideo className="w-3.5 h-3.5 text-violet-400" />
              <span>Arquivo Selecionado</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-white truncate max-w-[280px]">
                {videoName}
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 rounded">
                Pronto para Análise
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs text-slate-400 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">DURAÇÃO</span>
                <span className="text-slate-200">
                  {Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, '0')} min
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">RESOLUÇÃO</span>
                <span className="text-slate-200">{videoResolution}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">TAMANHO</span>
                <span className="text-slate-200">{fileSizeStr}</span>
              </div>
            </div>
          </div>

          {/* Target Durations Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gerar cortes de duração:</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[15, 30, 45, 60, 90].map((sec) => {
                const isSelected = selectedDurations.includes(sec);
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => toggleDuration(sec)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {sec}s
                  </button>
                );
              })}
            </div>
          </div>

          {/* Caption Style Preset Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Estilo inicial das legendas automáticas:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'viral', name: 'Viral 🔥', desc: 'Verde/Amarelo bold' },
                { id: 'minimal', name: 'Minimalista ✨', desc: 'Branco limpo' },
                { id: 'podcast', name: 'Podcast 🎙️', desc: 'Caixa alta laranja' },
                { id: 'gamer', name: 'Gamer 🎮', desc: 'Ciano neon cyber' },
                { id: 'premium', name: 'Premium 💎', desc: 'Dourado elegante' },
                { id: 'impact', name: 'Impacto ⚡', desc: 'Vermelho extra bold' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setCaptionPreset(style.id as CaptionPreset)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    captionPreset === style.id
                      ? 'border-violet-500 bg-violet-950/40 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{style.name}</div>
                  <div className="text-[10px] text-slate-400">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0a0e18] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleStartAnalysis}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-violet-600/30 hover:brightness-110 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Iniciar Análise Automática com IA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
