export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor';

export function evaluateConnectionQuality(pingMs: number): ConnectionQuality {
  if (pingMs < 80) return 'excellent';
  if (pingMs < 180) return 'good';
  if (pingMs < 350) return 'fair';
  return 'poor';
}

export function getConnectionQualityBadge(quality: ConnectionQuality): { color: string; label: string } {
  switch (quality) {
    case 'excellent':
      return { color: 'text-emerald-600', label: 'HD Audio' };
    case 'good':
      return { color: 'text-amber-600', label: 'Good' };
    case 'fair':
      return { color: 'text-yellow-600', label: 'Fair' };
    case 'poor':
      return { color: 'text-rose-600', label: 'Low Bandwidth' };
  }
}
