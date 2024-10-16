import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBrechaCambiariaColor(breach: number): string {
  if (breach > 10) return "text-red-500";
  if (breach > 5) return "text-orange-500";
  if (breach > 0) return "text-yellow-500";
  return "text-green-500";
}

export function getRiesgoPaisColor(riesgoPais: number): string {
  if (riesgoPais > 10) return "text-red-500";
  if (riesgoPais > 5) return "text-orange-500";
  if (riesgoPais > 0) return "text-yellow-500";
  return "text-green-500";
}

export function getInflacionColor(inflacion: number): string {
  if (inflacion > 10) return "text-red-500";
  if (inflacion > 5) return "text-orange-500";
  if (inflacion > 0) return "text-yellow-500";
  return "text-green-500";
}

export function getInflacionInteranualColor(
  inflacionInteranual: number
): string {
  if (inflacionInteranual > 10) return "text-red-500";
  if (inflacionInteranual > 5) return "text-orange-500";
  if (inflacionInteranual > 0) return "text-yellow-500";
  return "text-green-500";
}

export function getTextColor(index: number): string {
  if (index < 25) return "text-red-600 dark:text-red-400";
  if (index < 45) return "text-orange-500 dark:text-orange-400";
  if (index < 55) return "text-yellow-600 dark:text-yellow-400";
  if (index > 75) return "text-lime-600 dark:text-lime-400";
  return "text-green-600 dark:text-green-400";
}
