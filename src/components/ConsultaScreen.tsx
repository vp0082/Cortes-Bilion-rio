import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Dices, 
  ArrowRight, 
  CheckSquare, 
  Square,
  Sparkles,
  Info
} from 'lucide-react';
import { PLATAFORMAS_PADRAO } from '../services/simulationService';
import { formatCPF, validateCPFFormat, generateDemoCPF } from '../utils/cpf';
import { playTechClick } from '../utils/audio';

interface ConsultaScreenProps {
  onStartConsulta: (cpf: string, selectedPlatforms: string[], customPlatform?: string) => void;
  initialCpf?: string;
  initialPlatforms?: string[];
  initialCustomPlatform?: string;
}

export const ConsultaScreen: React.FC<ConsultaScreenProps> = ({
  onStartConsulta,
  initialCpf = '',
  initialPlatforms = ['betano', 'bet365', 'superbet', 'betnacional', 'esportes_da_sorte', 'betesporte'],
  initialCustomPlatform = '',
}) => {
  const [cpf, setCpf] = useState(initialCpf);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(initialPlatforms);
  const [customPlatform, setCustomPlatform] = useState(initialCustomPlatform);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
    if (errorMsg) setErrorMsg(null);
  };

  const handleGenerateTestCPF = () => {
    playTechClick();
    const testCpf = generateDemoCPF();
    setCpf(testCpf);
    if (errorMsg) setErrorMsg(null);
  };

  const togglePlatform = (id: string) => {
    playTechClick();
    if (selectedPlatforms.includes(id)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== id));
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const selectAllPlatforms = () => {
    playTechClick();
    setSelectedPlatforms(PLATAFORMAS_PADRAO.map((p) => p.id));
  };

  const clearPlatforms = () => {
    playTechClick();
    setSelectedPlatforms([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playTechClick();

    if (!cpf || !validateCPFFormat(cpf)) {
      setErrorMsg('Por favor, informe um CPF válido no formato 000.000.000-00.');
      return;
    }

    if (selectedPlatforms.length === 0) {
      setErrorMsg('Selecione ao menos uma plataforma para simular a consulta.');
      return;
    }

    if (selectedPlatforms.includes('outros') && !customPlatform.trim()) {
      setErrorMsg('Por favor, informe o nome da plataforma no campo "Outros".');
      return;
    }

    setErrorMsg(null);
    onStartConsulta(cpf, selectedPlatforms, customPlatform);
  };

  const isOutrosSelected = selectedPlatforms.includes('outros');
  const isCpfValid = validateCPFFormat(cpf);

  return (
    <div className="relative z-10 w-full max-w-3xl mx-auto px-4 py-8 sm:py-12 animate-in fade-in zoom-in-95 duration-500">
      {/* Top Banner / Disclaimer */}
      <div className="mb-6 p-4 rounded-xl border border-cyan-500/25 bg-cyan-950/20 backdrop-blur-md flex items-start gap-3 text-cyan-200/90 text-sm">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-white tracking-wide uppercase text-xs block mb-0.5">
            Ambiente Demonstrativo & Simulação
          </span>
          Esta ferramenta é uma <strong className="text-cyan-300">simulação visual fictícia</strong> para demonstração tecnológica. Nenhum dado real é consultado, nenhum banco de dados externo é acessado e nenhum valor real é atribuído.
        </div>
      </div>

      {/* Main Glass Panel */}
      <div className="glass-panel-glow rounded-2xl p-6 sm:p-10 relative overflow-hidden">
        {/* Holographic light accents */}
        <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        {/* Header Section */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center gap-2 text-xs font-mono text-cyan-400 border border-cyan-500/30 bg-cyan-950/50 px-3 py-1 rounded-full mb-3 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SISTEMA DE DEMONSTRAÇÃO FINANCEIRA</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 font-display">
            CONSULTA DE VALORES
          </h2>

          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            Faça uma simulação de consulta por CPF
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* CPF Input Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="cpfInput" 
                className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-slate-300 flex items-center gap-2 font-mono"
              >
                <CreditCard className="w-4 h-4 text-cyan-400" />
                Digite seu CPF
              </label>

              <button
                type="button"
                onClick={handleGenerateTestCPF}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Preencher com um CPF fictício para teste"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Gerar CPF de teste</span>
              </button>
            </div>

            <div className={`relative transition-all duration-300 rounded-xl ${
              isFocused 
                ? 'ring-2 ring-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.25)]' 
                : 'border border-slate-700/80 hover:border-slate-600'
            }`}>
              <input
                id="cpfInput"
                type="text"
                value={cpf}
                onChange={handleCpfChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full bg-slate-900/90 text-white font-mono text-lg sm:text-xl tracking-wider px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl outline-none placeholder:text-slate-600 focus:bg-slate-950 transition-colors"
                autoComplete="off"
              />

              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                {isCpfValid ? (
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-mono">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="hidden sm:inline">Formato Válido</span>
                  </div>
                ) : (
                  <span className="text-xs font-mono text-slate-500">
                    {cpf.replace(/\D/g, '').length}/11
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-xs text-slate-400 font-sans">
              Máscara automática: 000.000.000-00. Validação local sem transmissão de dados.
            </p>
          </div>

          {/* Platforms Selection Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <label className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-slate-300 font-mono">
                Selecione as plataformas
              </label>

              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={selectAllPlatforms}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Marcar todas
                </button>
                <span className="text-slate-600">·</span>
                <button
                  type="button"
                  onClick={clearPlatforms}
                  className="text-slate-400 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* Checkboxes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {PLATAFORMAS_PADRAO.map((platform) => {
                const isSelected = selectedPlatforms.includes(platform.id);
                return (
                  <div
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`group cursor-pointer select-none rounded-xl p-3.5 border transition-all duration-200 flex items-center justify-between ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-white'
                        : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`transition-colors ${isSelected ? 'text-cyan-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </div>
                      <span className="text-sm font-medium tracking-wide">
                        {platform.name}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Additional Field: "Digite o nome da plataforma" when "Outros" is checked */}
            {isOutrosSelected && (
              <div className="mt-3 p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <label 
                  htmlFor="customPlatformInput" 
                  className="block text-xs font-mono font-semibold text-purple-300 uppercase tracking-wider mb-1.5"
                >
                  Digite o nome da plataforma
                </label>
                <input
                  id="customPlatformInput"
                  type="text"
                  value={customPlatform}
                  onChange={(e) => {
                    setCustomPlatform(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Ex: Plataforma Customizada / Outra Bet"
                  className="w-full bg-slate-900/90 text-white font-sans text-sm px-4 py-2.5 rounded-lg border border-purple-500/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none placeholder:text-slate-600"
                />
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-950/30 text-rose-200 text-xs sm:text-sm flex items-center gap-2.5 animate-in shake duration-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Big Neon Consultar Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 bg-[length:200%_auto] hover:bg-right transition-[background-position,box-shadow,transform] duration-500 py-4 px-6 text-white font-display font-bold text-lg sm:text-xl tracking-wider uppercase flex items-center justify-center gap-3 neon-glow-button cursor-pointer"
            >
              {/* Button shine reflection overlay */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <span>CONSULTAR</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </button>

            <div className="text-center mt-3 text-xs font-mono text-slate-500">
              [DEMO] Ao clicar, a simulação cinematográfica de 20 segundos será iniciada
            </div>
          </div>
        </form>
      </div>

      {/* Trust & Transparency Footnote */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="p-3 rounded-lg border border-slate-800/80 bg-slate-950/40">
          <div className="text-cyan-400 text-xs font-mono font-semibold mb-1">100% LOCAL</div>
          <div className="text-slate-400 text-xs">Nenhuma informação sai do seu navegador</div>
        </div>
        <div className="p-3 rounded-lg border border-slate-800/80 bg-slate-950/40">
          <div className="text-purple-400 text-xs font-mono font-semibold mb-1">VALOR FICTÍCIO</div>
          <div className="text-slate-400 text-xs">Exemplo padrão para demonstração</div>
        </div>
        <div className="p-3 rounded-lg border border-slate-800/80 bg-slate-950/40">
          <div className="text-emerald-400 text-xs font-mono font-semibold mb-1">SEM VÍNCULO</div>
          <div className="text-slate-400 text-xs">Sem conexão com órgãos públicos ou casas de aposta</div>
        </div>
      </div>
    </div>
  );
};
