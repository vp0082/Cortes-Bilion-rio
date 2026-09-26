import React, { useEffect, useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Database, 
  Lock, 
  FastForward,
  Sparkles
} from 'lucide-react';
import { playScanTick, playSuccessChime } from '../utils/audio';

interface ProcessingModalProps {
  cpf: string;
  selectedPlatformsCount: number;
  onComplete: () => void;
  targetDurationMs?: number; // default 20000 (20s)
}

interface StepInfo {
  stage: number;
  title: string;
  subtitle: string;
  icon: typeof ShieldCheck;
}

const STAGES: StepInfo[] = [
  {
    stage: 1,
    title: 'Validando informações...',
    subtitle: 'Verificando formato estrutural do CPF e parâmetros criptográficos locais',
    icon: Lock,
  },
  {
    stage: 2,
    title: 'Processando consulta demonstrativa...',
    subtitle: 'Carregando módulos de demonstração financeira e simuladores locais',
    icon: Cpu,
  },
  {
    stage: 3,
    title: 'Verificando plataformas selecionadas...',
    subtitle: 'Auditando matriz demonstrativa das plataformas selecionadas pelo usuário',
    icon: Database,
  },
  {
    stage: 4,
    title: 'Finalizando simulação...',
    subtitle: 'Consolidando valores demonstrativos e gerando relatório visual',
    icon: ShieldCheck,
  },
];

export const ProcessingModal: React.FC<ProcessingModalProps> = ({
  cpf,
  selectedPlatformsCount,
  onComplete,
  targetDurationMs = 20000,
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    'Iniciando rotina de simulação local...',
  ]);
  const [isFinishing, setIsFinishing] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const lastStageRef = useRef<number>(0);
  const durationRef = useRef<number>(targetDurationMs);

  // Fast forward feature
  const handleFastForward = () => {
    // Cut remaining time to 1 second
    const elapsed = Date.now() - startTimeRef.current;
    durationRef.current = elapsed + 800;
    setTelemetryLogs((prev) => [
      ...prev,
      '>> [DEV] Aceleração de demonstração solicitada...',
    ]);
  };

  useEffect(() => {
    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const rawPct = Math.min(100, (elapsed / durationRef.current) * 100);
      setProgress(rawPct);

      // Determine stage (0 to 3)
      let stage = 0;
      if (rawPct < 25) stage = 0;
      else if (rawPct < 50) stage = 1;
      else if (rawPct < 75) stage = 2;
      else stage = 3;

      if (stage !== lastStageRef.current) {
        lastStageRef.current = stage;
        setCurrentStageIndex(stage);
        playScanTick();

        // Add telemetry log on stage change
        const seconds = Math.floor(elapsed / 1000);
        const timeStr = `00:${seconds < 10 ? '0' + seconds : seconds}`;
        const newLogs: Record<number, string> = {
          1: `[${timeStr}] Módulo 02 carregado: Iniciando ambiente sandbox demonstrativo...`,
          2: `[${timeStr}] Módulo 03 ativo: Verificando ${selectedPlatformsCount} canais simulados...`,
          3: `[${timeStr}] Módulo 04 final: Formatando relatório holográfico de simulação...`,
        };
        if (newLogs[stage]) {
          setTelemetryLogs((prev) => [...prev.slice(-4), newLogs[stage]]);
        }
      }

      if (rawPct >= 100) {
        clearInterval(interval);
        setIsFinishing(true);
        playSuccessChime();
        setTimeout(() => {
          onComplete();
        }, 800); // 800ms transition flash
      }
    }, 40);

    return () => clearInterval(interval);
  }, [durationRef, onComplete, selectedPlatformsCount]);

  const currentStage = STAGES[currentStageIndex];
  const StageIcon = currentStage.icon;
  const remainingSeconds = Math.max(0, Math.ceil((durationRef.current * (1 - progress / 100)) / 1000));

  // Circular calculations
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl transition-all duration-700 ${
      isFinishing ? 'scale-105 opacity-0' : 'scale-100 opacity-100'
    }`}>
      {/* Laser Scanning Line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] animate-scanline" />
      </div>

      {/* Holographic HUD Background Grid */}
      <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />

      {/* Ambient Radial Glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

      {/* Main Processing Box */}
      <div className="relative w-full max-w-xl glass-card-hologram rounded-3xl p-6 sm:p-10 border border-cyan-400/40 text-center shadow-[0_0_50px_rgba(6,182,212,0.25)]">
        {/* Hologram corner marks */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-6">
          <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>MOTOR DE SIMULAÇÃO EM EXECUÇÃO</span>
        </div>

        {/* Circular Loading Animation */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto mb-8 flex items-center justify-center">
          {/* Rotating outer dash ring */}
          <div className="absolute inset-0 border-2 border-dashed border-cyan-500/20 rounded-full animate-radar pointer-events-none" />
          
          {/* Rotating middle accent ring */}
          <div className="absolute inset-3 border border-purple-500/25 rounded-full [animation:radar-spin_8s_linear_infinite_reverse] pointer-events-none" />

          {/* SVG Circular Progress Bar */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 220 220">
            {/* Background Track */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="rgba(15, 23, 42, 0.8)"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated Progress Gradient Ring */}
            <defs>
              <linearGradient id="cyberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="url(#cyberGradient)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-75 ease-linear"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.7))',
              }}
            />
          </svg>

          {/* Center Content Inside Circle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className="w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center mb-1 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <StageIcon className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>

            <div className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white flex items-baseline justify-center">
              <span>{Math.floor(progress)}</span>
              <span className="text-lg font-mono text-cyan-400 ml-0.5">%</span>
            </div>

            <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1">
              <span>~{remainingSeconds}s restantes</span>
            </div>
          </div>
        </div>

        {/* Current Stage Display */}
        <div className="mb-6 min-h-[70px] flex flex-col justify-center">
          <div className="text-lg sm:text-xl font-bold font-display text-white mb-1 tracking-wide flex items-center justify-center gap-2">
            <span>{currentStage.title}</span>
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            {currentStage.subtitle}
          </p>
        </div>

        {/* Horizontal Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Progresso da Simulação</span>
            <span className="text-cyan-400 font-semibold">{progress.toFixed(0)}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full transition-all duration-100 ease-linear shadow-[0_0_12px_rgba(6,182,212,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Stepper Dots */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {STAGES.map((st, idx) => {
              const isPast = currentStageIndex > idx;
              const isCurrent = currentStageIndex === idx;
              return (
                <div key={st.stage} className="text-center">
                  <div className={`h-1.5 rounded-full mb-1 transition-all ${
                    isPast
                      ? 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
                      : isCurrent
                      ? 'bg-cyan-400/80 animate-pulse'
                      : 'bg-slate-800'
                  }`} />
                  <span className={`text-[10px] font-mono block truncate ${
                    isCurrent ? 'text-cyan-300 font-semibold' : 'text-slate-500'
                  }`}>
                    Etapa 0{st.stage}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Telemetry Console Log */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 text-left font-mono text-[11px] space-y-1 mb-4">
          <div className="text-slate-500 text-[10px] border-b border-slate-900 pb-1 flex items-center justify-between">
            <span>LOGS DE TELEMETRIA LOCAL</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              ATIVO
            </span>
          </div>
          {telemetryLogs.map((log, index) => (
            <div key={index} className="text-slate-300 truncate">
              <span className="text-cyan-400 mr-1.5">›</span>
              {log}
            </div>
          ))}
        </div>

        {/* Footer controls: Fast forward button for convenience */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            CPF: {cpf}
          </span>

          <button
            type="button"
            onClick={handleFastForward}
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors font-mono text-[11px] px-2 py-1 rounded bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 hover:border-cyan-500/30 cursor-pointer"
            title="Acelerar tempo para visualização imediata da demonstração"
          >
            <FastForward className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pular espera (Demo Rápida)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
