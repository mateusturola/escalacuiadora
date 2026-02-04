// Funções utilitárias
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata telefone no formato brasileiro (00) 00000-0000
 */
export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

/**
 * Remove formatação do telefone, retornando apenas números
 */
export function cleanPhone(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Formata data no formato brasileiro
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', options || {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Verifica se uma data é hoje
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Gera os dias do mês para o calendário
 */
export function getMonthDays(date: Date): (Date | null)[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const firstDayOfWeek = firstDay.getDay();
  
  const days: (Date | null)[] = [];
  
  // Adicionar dias vazios do início
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  
  // Adicionar todos os dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }
  
  return days;
}

/**
 * Formata nome dos dias da semana a partir de um array de números
 */
export function getDiasSemanaNomes(dias: number[], completo = true): string {
  const nomes = completo 
    ? ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    : ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return dias.map((d) => nomes[d]).join(', ');
}
