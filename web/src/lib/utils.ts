import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(date: string | Date, timeZone = 'America/Sao_Paulo') {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(date));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(date));
}
