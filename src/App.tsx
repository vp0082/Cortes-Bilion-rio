/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { UploadModal } from './components/UploadModal';
import { AnalysisLoadingView } from './components/AnalysisLoadingView';
import { ViralMomentsFinderView } from './components/ViralMomentsFinderView';
import { VideoEditorView } from './components/VideoEditorView';
import { MyClipsView } from './components/MyClipsView';
import { SubtitlesView } from './components/SubtitlesView';
import { AiSettingsView } from './components/AiSettingsView';
import { ExportModal } from './components/ExportModal';
import { Project, Clip, CaptionPreset } from './types/editor';
import { INITIAL_SAMPLE_PROJECTS, CAPTION_PRESETS } from './services/sampleData';
import { analyzeVideoWithAI } from './services/aiAnalysis';
import { Menu, Plus, UploadCloud, Flame, Sparkles } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [projects, setProjects] = useState<Project[]>(INITIAL_SAMPLE_PROJECTS);
  const [activeProject, setActiveProject] = useState<Project>(INITIAL_SAMPLE_PROJECTS[0]);
  const [activeClip, setActiveClip] = useState<Clip | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Analysis Loading state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStepMessage, setAnalysisStepMessage] = useState('');
  const [analyzingVideoName, setAnalyzingVideoName] = useState('');

  // Handle uploading and analyzing a new video
  const handleUploadAndAnalyze = async (params: {
    file?: File;
    name: string;
    url: string;
    duration: number;
    resolution: string;
    fileSizeFormatted: string;
    targetDurations: number[];
    captionStyle: CaptionPreset;
  }) => {
    setIsUploadModalOpen(false);
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalyzingVideoName(params.name);

    const newProjectId = `proj-${Date.now()}`;

    try {
      const result = await analyzeVideoWithAI(
        newProjectId,
        {
          videoName: params.name,
          duration: params.duration,
          preferredDurations: params.targetDurations,
        },
        (progress, step) => {
          setAnalysisProgress(progress);
          setAnalysisStepMessage(step);
        }
      );

      // Apply initial caption preset if chosen
      const styledClips = result.clips.map((c) => ({
        ...c,
        captionStyle: CAPTION_PRESETS[params.captionStyle] || c.captionStyle,
      }));

      const newProject: Project = {
        id: newProjectId,
        name: params.name.replace(/\.[^/.]+$/, ''),
        createdAt: 'Agora mesmo',
        status: 'analyzed',
        clipsCount: styledClips.length,
        videoMetadata: {
          id: `vid-${Date.now()}`,
          name: params.name,
          duration: params.duration,
          resolution: params.resolution,
          fileSizeFormatted: params.fileSizeFormatted,
          fps: 60,
          url: params.url,
          thumbnailUrl:
            'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
        },
        clips: styledClips,
      };

      setProjects((prev) => [newProject, ...prev]);
      setActiveProject(newProject);
      setIsAnalyzing(false);

      // Direct to Viral Finder view so user can inspect the AI hooks!
      setCurrentTab('ia');
    } catch (err) {
      console.error('Analysis error:', err);
      setIsAnalyzing(false);
    }
  };

  const handleEditClip = (clip: Clip, project?: Project) => {
    if (project) {
      setActiveProject(project);
    }
    setActiveClip(clip);
    setCurrentTab('novo-projeto' as any); // Render editor view
  };

  const handleExportClip = (clip: Clip) => {
    setActiveClip(clip);
    setIsExportModalOpen(true);
  };

  const handleUpdateClip = (updatedClip: Clip) => {
    setActiveClip(updatedClip);
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === updatedClip.projectId) {
          return {
            ...p,
            clips: p.clips.map((c) => (c.id === updatedClip.id ? updatedClip : c)),
          };
        }
        return p;
      })
    );
  };

  const totalClipsCount = projects.reduce((acc, p) => acc + (p.clips?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[#070912] text-slate-100 flex flex-col md:flex-row antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'novo-projeto') {
            setIsUploadModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        clipsTotalCount={totalClipsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#090c16]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 md:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:block">
              <span className="text-[11px] font-mono font-bold text-violet-400 uppercase tracking-wider block">
                Workspace Ativo
              </span>
              <span className="text-sm font-bold text-white">
                {activeProject.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveProject(projects[0]);
                setCurrentTab('ia');
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Momentos Virais</span>
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md hover:shadow-violet-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enviar Vídeo</span>
            </button>
          </div>
        </header>

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {/* If an active clip is selected for editing, show the Video Editor */}
          {activeClip ? (
            <VideoEditorView
              clip={activeClip}
              videoUrl={activeProject.videoMetadata.url}
              onUpdateClip={handleUpdateClip}
              onExport={handleExportClip}
              onBack={() => setActiveClip(null)}
            />
          ) : currentTab === 'dashboard' ? (
            <DashboardView
              projects={projects}
              onOpenNewProject={() => setIsUploadModalOpen(true)}
              onOpenViralFinder={() => {
                setActiveProject(projects[0]);
                setCurrentTab('ia');
              }}
              onEditClip={handleEditClip}
              onExportClip={handleExportClip}
              onOpenProject={(proj) => {
                setActiveProject(proj);
                if (proj.clips.length > 0) {
                  handleEditClip(proj.clips[0], proj);
                }
              }}
            />
          ) : currentTab === 'meus-cortes' ? (
            <MyClipsView
              projects={projects}
              onEditClip={handleEditClip}
              onExportClip={handleExportClip}
            />
          ) : currentTab === 'legendas' ? (
            <SubtitlesView />
          ) : currentTab === 'ia' ? (
            <ViralMomentsFinderView
              project={activeProject}
              onSelectClipToEdit={(clip) => handleEditClip(clip, activeProject)}
              onBackToDashboard={() => setCurrentTab('dashboard')}
            />
          ) : currentTab === 'projetos' ? (
            <DashboardView
              projects={projects}
              onOpenNewProject={() => setIsUploadModalOpen(true)}
              onOpenViralFinder={() => setCurrentTab('ia')}
              onEditClip={handleEditClip}
              onExportClip={handleExportClip}
              onOpenProject={(proj) => {
                setActiveProject(proj);
                if (proj.clips.length > 0) {
                  handleEditClip(proj.clips[0], proj);
                }
              }}
            />
          ) : (
            <AiSettingsView />
          )}
        </main>
      </div>

      {/* Upload & New Project Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmitVideo={handleUploadAndAnalyze}
      />

      {/* Video Analysis Overlay */}
      {isAnalyzing && (
        <AnalysisLoadingView
          progress={analysisProgress}
          stepMessage={analysisStepMessage}
          videoName={analyzingVideoName}
        />
      )}

      {/* Export to TikTok Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        clip={activeClip || (activeProject.clips[0] || null)}
        allClips={activeProject.clips}
        videoUrl={activeProject.videoMetadata.url}
      />
    </div>
  );
}
