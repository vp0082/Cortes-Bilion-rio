import React from 'react';
import { X, Code2, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';
import { playTechClick } from '../utils/audio';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel-glow rounded-2xl p-6 sm:p-8 border border-cyan-500/40 text-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => {
            playTechClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900/60 rounded-lg border border-slate-700 hover:border-cyan-500/40 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-white">
              Arquitetura & Especificações Técnicas
            </h3>
            <p className="text-xs font-mono text-cyan-400">
              Sistema de Demonstração Isolado
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-300 font-sans leading-relaxed">
          {/* Card 1 */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-mono font-semibold text-xs uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Execução 100% no Cliente (Sem Backend Externo)
            </div>
            <p className="text-xs text-slate-400">
              O CPF digitado nunca é enviado pela rede. A validação matemática de dígitos, a formatação e a simulação ocorrem estritamente na memória da aba atual do navegador.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-mono font-semibold text-xs uppercase">
              <Cpu className="w-4 h-4 text-purple-400" />
              Como Substituir por uma API Real Futura
            </div>
            <p className="text-xs text-slate-400">
              O projeto possui separação de responsabilidades. Para conectar a uma fonte legítima no futuro:
            </p>
            <div className="p-3 bg-slate-950 rounded-lg font-mono text-[11px] text-cyan-300 border border-slate-800">
              <code>
                // Arquivo: src/services/simulationService.ts<br />
                // Basta alterar a função executarConsultaSimulada() para uma chamada fetch():<br />
                const response = await fetch('/api/v1/consulta-autorizada', &#123; ... &#125;);
              </code>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90 text-xs">
            <strong className="block mb-1 font-mono uppercase text-amber-300">
              Conformidade e Transparência
            </strong>
            Todos os valores apresentados nesta aplicação são simulações demonstrativas. O sistema não tem qualquer conexão com os servidores das plataformas mencionadas.
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              playTechClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span>Entendi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
