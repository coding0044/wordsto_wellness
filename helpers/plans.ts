export function normalizePlanKey(planKey?: string | null): string {
  if (!planKey) return '';
  const normalized = planKey.toString().toLowerCase().trim();
  if (normalized === 'pro') return 'expert';
  return normalized;
}
