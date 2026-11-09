export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function nightsBetween(start: Date, end: Date): number {
  const milliseconds = end.getTime() - start.getTime();
  return Math.max(0, Math.round(milliseconds / 86_400_000));
}

export function assertDateRange(start: Date, end: Date): void {
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Fecha inválida");
  }
  if (start >= end) {
    throw new Error("La fecha de inicio debe ser anterior a la de fin");
  }
}
