export function compactNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`;
  }
  if (abs >= 1000) {
    return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(n);
}

export function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) {
    return 'just now';
  }
  const m = s / 60;
  if (m < 60) {
    return `${Math.floor(m)}m`;
  }
  const h = m / 60;
  if (h < 24) {
    return `${Math.floor(h)}h`;
  }
  const d = h / 24;
  if (d < 7) {
    return `${Math.floor(d)}d`;
  }
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function timeAgoLong(iso: string): string {
  const short = timeAgo(iso);
  if (short === 'just now') {
    return short;
  }
  const n = parseInt(short, 10);
  if (Number.isNaN(n)) {
    return `on ${short}`;
  }
  const unit = short.endsWith('m') ? 'minute' : short.endsWith('h') ? 'hour' : 'day';
  return `${n} ${unit}${n === 1 ? '' : 's'} ago`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return '·';
  }
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
