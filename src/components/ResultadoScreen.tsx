import React, { useState } from 'react';
import { 
  CheckCircle, 
  ArrowLeft, 
  SlidersHorizontal, 
  Copy, 
  Check, 
  Printer, 
  AlertTriangle, 
  Layers, 
  Calendar, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SimulationResult } from '../services/simulationService';
import { playTechClick } from '../utils/audio';

interface ResultadoScreenProps {
  result: SimulationResult;
  onNovaConsulta: () => void;
  onAlterarPlataformas: () => void;
}

export const ResultadoScreen: React.FC<ResultadoScreenProps> = ({
  result,
  onNovaConsulta,
  onAlterarPlataformas,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPlatformDetails, setShowPlatformDetails] = useState(false);

  const handleCopySummary = () => {
    playTechClick();
    const summary = `[DEMONSTRAÇÃO DE CONSULTA DE VALORES]
Protocolo: ${result.protocolo}
Data/Hora: ${result.dataHora}
CPF Simulado: ${result.cpfMascarado}
Valor Simulado Total: ${result.valorSimuladoFormatado}
Plataformas Selecionadas: ${result.plataformasConsultadas.join(', ')}

AVISO LEGAL: ${result.avisoLegal}
Este valor é meramente fictício e gerado para fins de demonstração visual de interface.`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrint = () => {
    playTechClick();
    window.print();
  };

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 animate-in fade-in zoom-in-95 duration-500">
      {/* Top Protocol / Status Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/70 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              SIMULAÇÃO CONCLUÍDA
            </div>
            <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <span>Protocolo: <strong className="text-cyan-300">{result.protocolo}</strong></span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                {result.dataHora}
              </span>
            </div>
          </div>
        </div>

        {/* Action utility buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-cyan-300 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700 hover:border-cyan-500/40 rounded-lg transition-colors cursor-pointer"
            title="Copiar dados da simulação"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copiar Resumo</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-cyan-300 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700 hover:border-cyan-500/40 rounded-lg transition-colors cursor-pointer"
            title="Imprimir relatório demonstrativo"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      </div>

      {/* Screen Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 font-display">
          RESULTADO DA SIMULAÇÃO
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto font-sans">
          Painel holográfico demonstrativo consolidado com base nos parâmetros selecionados.
        </p>
      </div>

      {/* MAIN SPOTLIGHT CARD WITH HOLOGRAPHIC EFFECT */}
      <div className="relative glass-card-hologram rounded-3xl p-6 sm:p-12 mb-8 border border-cyan-400/40 shadow-[0_0_60px_rgba(6,182,212,0.2)] overflow-hidden">
        {/* Holographic light accents */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

        {/* Ambient Corner Decors */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none" />

        <div className="text-center relative z-10">
          {/* Label: VALOR SIMULADO */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 font-mono text-xs sm:text-sm uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>VALOR SIMULADO</span>
          </div>

          {/* Big Featured Value: R$ 1.400,00 */}
          <div className="my-2 sm:my-4">
            <div className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-300 drop-shadow-[0_0_35px_rgba(6,182,212,0.5)]">
              {result.valorSimuladoFormatado}
            </div>
          </div>

          {/* Subtitle statement */}
          <p className="text-slate-300 text-sm sm:text-base font-medium max-w-xl mx-auto mt-4 mb-2">
            Este valor é apenas um exemplo fictício para demonstração da ferramenta.
          </p>

          <p className="text-xs font-mono text-cyan-400/80">
            CPF Simulado: {result.cpfMascarado}
          </p>
        </div>

        {/* Selected Platforms List Section */}
        <div className="mt-8 pt-8 border-t border-slate-800/80 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Plataformas selecionadas:
            </h3>

            <button
              onClick={() => {
                playTechClick();
                setShowPlatformDetails(!showPlatformDetails);
              }}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>{showPlatformDetails ? 'Ocultar demonstrativo detalhado' : 'Ver demonstrativo por plataforma'}</span>
              {showPlatformDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Platform chips/list */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {result.plataformasConsultadas.map((plataforma, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-slate-200 flex items-center gap-2.5 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] shrink-0" />
                <span className="text-xs sm:text-sm font-medium tracking-wide truncate">
                  {plataforma}
                </span>
              </div>
            ))}
          </div>

          {/* Interactive Demonstrative Breakdown (Drawer) */}
          {showPlatformDetails && (
            <div className="mt-4 p-4 rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
              <div className="text-xs font-mono text-slate-400 mb-3 uppercase tracking-wider">
                Composição Demonstrativa da Simulação (Total: {result.valorSimuladoFormatado})
              </div>
              <div className="space-y-2">
                {result.detalhesPorPlataforma.map((detalhe, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-900 last:border-0 font-mono">
                    <span className="text-slate-300">{detalhe.platformName}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-cyan-300 font-semibold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(detalhe.valorSimulado)}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                        {detalhe.statusSimulado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl border border-amber-500/40 bg-amber-950/20 backdrop-blur-md flex items-start gap-3.5 text-amber-200/90 text-xs sm:text-sm shadow-[0_0_25px_rgba(245,158,11,0.1)]">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-amber-300 uppercase tracking-wider block mb-1 font-mono text-xs">
            AVISO LEGAL IMPORTANTE
          </span>
          {result.avisoLegal}
        </div>
      </div>

      {/* Action Buttons: "← NOVA CONSULTA" and "ALTERAR PLATAFORMAS" */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => {
            playTechClick();
            onNovaConsulta();
          }}
          className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-display font-semibold text-sm tracking-wider uppercase border border-slate-700 hover:border-slate-500 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-cyan-950/50"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>← NOVA CONSULTA</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playTechClick();
            onAlterarPlataformas();
          }}
          className="w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white font-display font-bold text-sm tracking-wider uppercase neon-glow-button cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>ALTERAR PLATAFORMAS</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="mt-12 text-center text-xs font-mono text-slate-500 border-t border-slate-900 pt-6">
        <div>Consulta de Valores — Demonstração Tecnológica</div>
        <div className="mt-1 text-slate-600">Simulador de Interface v2.5 · Arquitetura Segura no Navegador</div>
      </div>
    </div>
  );
};
