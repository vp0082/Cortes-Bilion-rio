import React, { useState } from 'react';
import {
  Scissors,
  Flame,
  Clock,
  Download,
  Play,
  Search,
  SlidersHorizontal,
  Share2,
  Trash2,
} from 'lucide-react';
import { Clip, Project } from '../types/editor';

interface MyClipsViewProps {
  projects: Project[];
  onEditClip: (clip: Clip, project: Project) => void;
  onExportClip: (clip: Clip) => void;
}

export const MyClipsView: React.FC<MyClipsViewProps> = ({
  projects,
  onEditClip,
  onExportClip,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDurationFilter, setSelectedDurationFilter] = useState<'all' | '15' | '30' | '60'>('all');

  const allClips = projects.flatMap((p) => p.clips.map((c) => ({ clip: c, project: p })));

  const filtered = allClips.filter(({ clip }) => {
    const matchesSearch =
      clip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clip.fullText.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedDurationFilter === '15') return clip.duration <= 20;
    if (selectedDurationFilter === '30') return clip.duration > 20 && clip.duration <= 35;
    if (selectedDurationFilter === '60') return clip.duration > 35;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2 font-display">
            <Scissors className="w-5 h-5 text-violet-400" />
            Meus Cortes Gerados ({allClips.length})
          </h1>
          <p className="text-xs text-slate-400">
            Todos os cortes verticais 9:16 gerados automaticamente prontos para publicação.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por fala ou título..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-violet-500 outline-none w-48 sm:w-64"
            />
          </div>

          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 text-xs">
            {(
              [
                { id: 'all', label: 'Todos' },
                { id: '15', label: '≤15s' },
                { id: '30', label: '~30s' },
                { id: '60', label: '60s+' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedDurationFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedDurationFilter === f.id
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of clips */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          Nenhum corte encontrado para os filtros selecionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(({ clip, project }) => (
            <div
              key={clip.id}
              className="editor-card rounded-2xl p-4 bg-[#0d111d] border border-slate-800/90 hover:border-violet-500/50 flex flex-col justify-between group transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-mono">
                    <Flame className="w-3 h-3 fill-amber-400" />
                    Score {clip.viralScore}/100
                  </span>

                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {clip.duration}s
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug group-hover:text-violet-300 transition-colors">
                  {clip.title}
                </h3>

                <p className="text-xs text-slate-400 italic line-clamp-2">
                  "{clip.fullText}"
                </p>

                <div className="p-2 rounded-lg bg-slate-950 text-[11px] text-slate-400">
                  <span className="text-cyan-400 font-semibold block mb-0.5">Origem:</span>
                  <span className="truncate block">{project.name}</span>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => onEditClip(clip, project)}
                  className="flex-1 py-2 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Editar 9:16</span>
                </button>

                <button
                  onClick={() => onExportClip(clip)}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Exportar para TikTok"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
