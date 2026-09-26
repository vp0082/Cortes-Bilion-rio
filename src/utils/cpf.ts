/**
 * Utilitários para formatação e validação de CPF.
 * Execução 100% no cliente (browser) sem envio a qualquer servidor.
 */

export function formatCPF(value: string): string {
  // Remove tudo que não é dígito
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

export function validateCPFFormat(cpf: string): boolean {
  const digits = cleanCPF(cpf);
  return digits.length === 11;
}

/**
 * Validação do algoritmo matemático do CPF brasileiro.
 */
export function validateCPFChecksum(cpf: string): boolean {
  const clean = cleanCPF(cpf);
  if (clean.length !== 11) return false;

  // Rejeita sequências de números repetidos óbvios (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  let remainder: number;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(clean.substring(i - 1, i), 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(9, 10), 10)) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(clean.substring(i - 1, i), 10) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(10, 11), 10)) return false;

  return true;
}

/**
 * Gera um CPF fictício matematicamente válido para testes rápidos de demonstração
 */
export function generateDemoCPF(): string {
  const rnd = () => Math.floor(Math.random() * 9);
  const n = Array.from({ length: 9 }, rnd);

  let d1 = n.reduce((total, num, idx) => total + num * (10 - idx), 0);
  d1 = 11 - (d1 % 11);
  if (d1 >= 10) d1 = 0;

  let d2 = n.reduce((total, num, idx) => total + num * (11 - idx), 0) + d1 * 2;
  d2 = 11 - (d2 % 11);
  if (d2 >= 10) d2 = 0;

  const raw = [...n, d1, d2].join('');
  return formatCPF(raw);
}

export function maskCPFForDisplay(cpf: string): string {
  const clean = cleanCPF(cpf);
  if (clean.length < 11) return cpf;
  return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`;
}
