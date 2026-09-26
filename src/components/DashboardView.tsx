import React from 'react';
import {
  Film,
  Scissors,
  Clock,
  Download,
  Flame,
  UploadCloud,
  Play,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Project, Clip } from '../types/editor';

interface DashboardViewProps {
  projects: Project[];
  onOpenNewProject: () => void;
  onOpenViralFinder: () => void;
  onEditClip: (clip: Clip, project: Project) => void;
  onExportClip: (clip: Clip) => void;
  onOpenProject: (project: Project) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  onOpenNewProject,
  onOpenViralFinder,
  onEditClip,
  onExportClip,
  onOpenProject,
}) => {
  const totalClips = projects.reduce((acc, p) => acc + (p.clips?.length || 0), 0);
  const totalDurationMin = Math.round(
    projects.reduce((acc, p) => acc + (p.videoMetadata?.duration || 0), 0) / 60
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome & Quick Launch */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-950/60 via-slate-900 to-slate-900 border border-violet-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/60 border border-violet-500/40 text-violet-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>CUTS AI PRO V3.8 · MOTOR DE VIRALIZAÇÃO 9:16</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
              Transforme vídeos longos em <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-300 to-white">cortes virais automáticos</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Carregue podcasts, entrevistas, aulas e gameplays. Nossa IA identifica os momentos de maior retenção, gera legendas sincronizadas palavra por palavra e reenquadra para o formato vertical.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={onOpenViralFinder}
              className="flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg hover:shadow-orange-500/25 hover:brightness-110 transition-all cursor-pointer glow-viral"
            >
              <Flame className="w-4 h-4 fill-slate-950" />
              <span>ENCONTRAR MOMENTOS VIRAIS</span>
            </button>

            <button
              onClick={onOpenNewProject}
              className="flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg hover:shadow-violet-600/30 hover:brightness-110 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>📤 ENVIAR VÍDEO</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="editor-card rounded-2xl p-5 border border-slate-800 bg-[#0d111d]">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Vídeos Processados</span>
            <div className="w-8 h-8 rounded-lg bg-violet-950/60 border border-violet-800/50 flex items-center justify-center text-violet-400">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-display">
            {projects.length + 13}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+4 vídeos nesta semana</span>
          </div>
        </div>

        <div className="editor-card rounded-2xl p-5 border border-slate-800 bg-[#0d111d]">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Cortes Gerados</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-display">
            {totalClips + 65}
          </div>
          <div className="text-[11px] text-cyan-300 mt-1">
            Formatos 15s, 30s, 45s e 60s
          </div>
        </div>

        <div className="editor-card rounded-2xl p-5 border border-slate-800 bg-[#0d111d]">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Tempo Economizado</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-display">
            28.4h
          </div>
          <div className="text-[11px] text-amber-300 mt-1">
            ~45min por vídeo economizados
          </div>
        </div>

        <div className="editor-card rounded-2xl p-5 border border-slate-800 bg-[#0d111d]">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Cortes Exportados</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-display">
            42
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            MP4 1080×1920 60FPS
          </div>
        </div>
      </div>

      {/* Featured Viral Cuts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
              Cortes com Maior Potencial Viral Recomendados
            </h2>
            <p className="text-xs text-slate-400">
              Detectados por frases fortes, quebras de padrão e ganchos de alta retenção.
            </p>
          </div>
          <button
            onClick={onOpenViralFinder}
            className="text-xs font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Ver análise completa de ganchos</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.flatMap((p) => p.clips.slice(0, 1)).slice(0, 3).map((clip) => {
            const project = projects.find((p) => p.id === clip.projectId) || projects[0];
            return (
              <div
                key={clip.id}
                className="editor-card rounded-2xl p-4 flex flex-col justify-between group relative overflow-hidden bg-slate-900/60 border border-slate-800 hover:border-violet-500/50"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                      Score {clip.viralScore}/100
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {clip.duration}s (9:16)
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug group-hover:text-violet-300 transition-colors">
                    {clip.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 italic">
                    "{clip.fullText}"
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300 leading-snug">
                    <strong className="text-amber-400 block mb-0.5">Por que viraliza:</strong>
                    {clip.whyViral}
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onEditClip(clip, project)}
                    className="flex-1 py-2 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Editar no 9:16</span>
                  </button>

                  <button
                    onClick={() => onExportClip(clip)}
                    className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Exportar para TikTok"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MEUS PROJETOS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
              <Layers className="w-5 h-5 text-violet-400" />
              MEUS PROJETOS
            </h2>
            <p className="text-xs text-slate-400">
              Vídeos importados, histórico de processamento e cortes gerados.
            </p>
          </div>

          <button
            onClick={onOpenNewProject}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-colors cursor-pointer"
          >
            <Film className="w-3.5 h-3.5 text-violet-400" />
            <span>Novo Projeto</span>
          </button>
        </div>

        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="editor-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0c101c] border border-slate-800 hover:border-violet-500/40"
            >
              <div className="flex items-center gap-4">
                {/* Thumbnail */}
                <div className="relative w-24 h-16 sm:w-28 sm:h-18 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 group">
                  <img
                    src={project.videoMetadata.thumbnailUrl}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white/80 fill-white/80" />
                  </div>
                  <div className="absolute bottom-1 right-1 text-[10px] font-mono px-1 rounded bg-black/80 text-white">
                    {Math.floor(project.videoMetadata.duration / 60)}:
                    {(project.videoMetadata.duration % 60).toString().padStart(2, '0')}
                  </div>
                </div>

                {/* Project details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      {project.name}
                    </h3>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/50">
                      {project.status === 'analyzed' ? 'Concluído' : 'Processando'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    <span>{project.clips.length} cortes gerados</span>
                    <span className="text-slate-600">·</span>
                    <span>{project.videoMetadata.resolution}</span>
                    <span className="text-slate-600">·</span>
                    <span>{project.videoMetadata.fileSizeFormatted}</span>
                    <span className="text-slate-600">·</span>
                    <span>{project.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 sm:self-center">
                <button
                  onClick={() => onOpenProject(project)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                >
                  <Scissors className="w-3.5 h-3.5 text-violet-400" />
                  <span>Editar Cortes</span>
                </button>

                <button
                  onClick={() => onExportClip(project.clips[0])}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
