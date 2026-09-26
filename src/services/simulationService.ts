/**
 * SERVIÇO DE SIMULAÇÃO — ARQUITETURA MODULAR
 * 
 * NOTA DE ARQUITETURA:
 * Esta camada foi projetada para isolar 100% da lógica de simulação.
 * Atualmente gera dados fictícios locais em memória.
 * Caso futuramente seja integrada uma API legítima e autorizada de banco de dados
 * ou serviços financeiros, basta substituir a implementação interna de
 * `executarConsultaSimulada()` por uma chamada REST/GraphQL autenticada,
 * mantendo a mesma assinatura de retorno (SimulationResult).
 */

export interface PlatformItem {
  id: string;
  name: string;
  isCustom?: boolean;
}

export interface PlatformResultDetail {
  platformName: string;
  valorSimulado: number;
  statusSimulado: 'Disponível' | 'Em Análise' | 'Liberado';
}

export interface SimulationResult {
  isDemonstracao: true;
  protocolo: string;
  dataHora: string;
  cpfFormatado: string;
  cpfMascarado: string;
  valorSimuladoTotal: number;
  valorSimuladoFormatado: string;
  plataformasConsultadas: string[];
  detalhesPorPlataforma: PlatformResultDetail[];
  avisoLegal: string;
  resumoSeguranca: string;
}

export const PLATAFORMAS_PADRAO: PlatformItem[] = [
  { id: 'betano', name: 'Betano' },
  { id: 'bet365', name: 'bet365' },
  { id: 'superbet', name: 'Superbet' },
  { id: 'betnacional', name: 'Betnacional' },
  { id: 'esportes_da_sorte', name: 'Esportes da Sorte' },
  { id: 'betesporte', name: 'Betesporte' },
  { id: 'outros', name: 'Outros', isCustom: true },
];

/**
 * Executa a simulação local gerando o valor padrão R$ 1.400,00 solicitado
 * e distribuindo de maneira proporcional e estética entre as plataformas selecionadas.
 */
export function executarConsultaSimulada(
  cpf: string,
  selectedPlatforms: string[],
  customPlatformName?: string
): SimulationResult {
  // Lista final de nomes de plataformas selecionadas
  const plataformasFinal: string[] = selectedPlatforms.map((id) => {
    if (id === 'outros' && customPlatformName && customPlatformName.trim() !== '') {
      return customPlatformName.trim();
    }
    const found = PLATAFORMAS_PADRAO.find((p) => p.id === id);
    return found ? found.name : id;
  });

  // O valor principal padrão solicitado para a demonstração é R$ 1.400,00
  const valorTotal = 1400.00;

  // Distribuição demonstrativa do valor entre as plataformas selecionadas
  const count = plataformasFinal.length || 1;
  const baseFraction = Math.floor((valorTotal / count) * 100) / 100;
  let accumulated = 0;

  const detalhes: PlatformResultDetail[] = plataformasFinal.map((nome, index) => {
    const isLast = index === count - 1;
    const valor = isLast ? Number((valorTotal - accumulated).toFixed(2)) : baseFraction;
    accumulated += valor;

    return {
      platformName: nome,
      valorSimulado: valor,
      statusSimulado: index % 2 === 0 ? 'Disponível' : 'Liberado',
    };
  });

  const protocolo = `SIM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const dataHora = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date());

  return {
    isDemonstracao: true,
    protocolo,
    dataHora,
    cpfFormatado: cpf,
    cpfMascarado: cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '***.$2.$3-**'),
    valorSimuladoTotal: valorTotal,
    valorSimuladoFormatado: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valorTotal),
    plataformasConsultadas: plataformasFinal,
    detalhesPorPlataforma: detalhes,
    avisoLegal: 'Esta demonstração não consulta contas, saldos, CPF, bancos ou sistemas das plataformas. O valor apresentado é fictício.',
    resumoSeguranca: 'Ambiente de testes estritamente local. Nenhum dado pessoal transitou por servidores remotos.',
  };
}
