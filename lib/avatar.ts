// Avatar generado en local: antes se pedia a api.dicebear.com con el id del
// usuario como seed, lo que filtraba ese id a un tercero en cada carga de perfil.
// Un SVG de iniciales como data URI no sale de la app.

const COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#D946EF', '#EC4899',
];

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** SVG de iniciales como data URI, sin llamada de red ni datos que salgan del dispositivo. */
export function generateAvatarDataUri(name: string, seed: string): string {
  const initials = getInitials(name);
  const color = COLORS[hashSeed(seed) % COLORS.length];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<rect width="100" height="100" fill="${color}"/>` +
    `<text x="50" y="58" text-anchor="middle" fill="#fff" font-size="38" ` +
    `font-family="system-ui,sans-serif" font-weight="700">${initials}</text>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
