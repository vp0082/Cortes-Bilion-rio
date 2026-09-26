import React from 'react';
import {
  LayoutDashboard,
  Film,
  Scissors,
  Subtitles,
  Bot,
  FolderOpen,
  Settings,
  Sparkles,
  Zap,
  TrendingUp,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'novo-projeto'
  | 'meus-cortes'
  | 'legendas'
  | 'ia'
  | 'projetos'
  | 'configuracoes';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  clipsTotalCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
  clipsTotalCount,
}) => {
  const navItems: Array<{ id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: string | number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'novo-projeto', label: 'Novo projeto', icon: Film, badge: 'Upload' },
    { id: 'meus-cortes', label: 'Meus cortes', icon: Scissors, badge: clipsTotalCount },
    { id: 'legendas', label: 'Legendas', icon: Subtitles },
    { id: 'ia', label: 'IA & Viralidade', icon: Bot, badge: 'Pro' },
    { id: 'projetos', label: 'Projetos', icon: FolderOpen },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0a0d17] border-r border-slate-800/80 z-50 flex flex-col justify-between transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              <div className="w-full h-full bg-[#0a0d17] rounded-[10px] flex items-center justify-center">
                <Scissors className="w-5 h-5 text-violet-400 -rotate-45" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white font-display">
                  CUTS AI
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-sm">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Editor Automático 9:16</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Principal
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-violet-600/15 text-violet-300 border border-violet-500/30 font-semibold shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-violet-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-violet-500 text-white'
                        : typeof item.badge === 'string'
                        ? 'bg-slate-800 text-violet-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Virality Widget in Sidebar */}
        <div className="p-3 mx-3 mb-3 rounded-xl bg-gradient-to-b from-slate-900 to-violet-950/40 border border-violet-500/20 p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Algoritmo Viral Ativo
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">v3.8 Flash</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug mb-3">
            Otimizado para a recomendação atual do TikTok, Reels e Shorts.
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full w-[94%]" />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-mono">
            <span>Precisão do Gancho</span>
            <span className="text-violet-300 font-semibold">94%</span>
          </div>
        </div>

        {/* User / Pro Status Footer */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              CP
            </div>
            <div>
              <div className="text-xs font-semibold text-white leading-tight">Creator Pro</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                Render 4K 60FPS
              </div>
            </div>
          </div>

          <div className="text-slate-400 text-xs" title="Exportações Ilimitadas">
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>
        </div>
      </aside>
    </>
  );
};
