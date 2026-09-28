// Comprueba el contraste WCAG 2.1 de los tokens definidos en index.css.
// Los valores no se estiman: se leen del propio CSS y se miden.
//   node scripts/check-contrast.mjs
// Sale con codigo 1 si algun par obligatorio no llega a su umbral.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(root, 'index.css'), 'utf8');

/** Extrae los tokens `--c-*: R G B;` del bloque del selector indicado. */
function readTokens(selector) {
  const start = css.indexOf(selector + ' {');
  if (start === -1) throw new Error(`No encuentro el bloque ${selector}`);
  const block = css.slice(start, css.indexOf('}', start));
  const tokens = {};
  for (const [, name, r, g, b] of block.matchAll(
    /--c-([a-z-]+):\s*(\d+)\s+(\d+)\s+(\d+)\s*;/g
  )) {
    tokens[name] = [Number(r), Number(g), Number(b)];
  }
  return tokens;
}

const channel = (v) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

function ratio(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const hex = ([r, g, b]) =>
  '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0').toUpperCase()).join('');

// AA: 4.5 para texto normal, 3.0 para texto grande y para limites de componente.
const TEXT = 4.5;
const UI = 3.0;

/** Pares que tienen que cumplir, con su umbral. */
const pairs = [
  ['text-primary', 'bg', TEXT],
  ['text-primary', 'surface', TEXT],
  ['text-secondary', 'bg', TEXT],
  ['text-secondary', 'surface', TEXT],
  ['text-muted', 'bg', TEXT],
  ['text-muted', 'surface', TEXT],
  ['primary', 'bg', UI],
  ['primary', 'surface', UI],
  ['primary-ink', 'primary', TEXT],
  ['border-input', 'surface', UI],
  ['success', 'bg', TEXT],
  ['success', 'surface', TEXT],
  ['warning', 'bg', TEXT],
  ['warning', 'surface', TEXT],
  ['danger', 'bg', TEXT],
  ['danger', 'surface', TEXT],
  ['info', 'bg', TEXT],
  ['info', 'surface', TEXT],
  ['celebration', 'bg', TEXT],
  ['celebration', 'surface', TEXT],
  ['success-ink', 'success-fill', TEXT],
  ['warning-ink', 'warning-fill', TEXT],
  ['danger-ink', 'danger-fill', TEXT],
  ['info-ink', 'info-fill', TEXT],
  ['strength', 'bg', TEXT],
  ['strength', 'surface', TEXT],
  ['cardio', 'bg', TEXT],
  ['cardio', 'surface', TEXT],
  ['mobility', 'bg', TEXT],
  ['mobility', 'surface', TEXT],
  ['rest', 'bg', TEXT],
  ['rest', 'surface', TEXT],
  ['text-muted', 'surface-raised', TEXT],
  ['text-primary', 'surface-raised', TEXT],
];

let failed = 0;
for (const [label, selector] of [
  ['MODO OSCURO', ':root, .dark'],
  ['MODO CLARO', '.light'],
]) {
  const t = readTokens(selector);
  console.log(`\n${label}`);
  for (const [fg, bg, min] of pairs) {
    if (!t[fg] || !t[bg]) throw new Error(`Token ausente en ${selector}: ${fg} / ${bg}`);
    const r = ratio(t[fg], t[bg]);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(
      `  ${ok ? 'OK  ' : 'FALLA'} ${r.toFixed(2).padStart(6)}:1 (min ${min})  ` +
        `${fg} ${hex(t[fg])} sobre ${bg} ${hex(t[bg])}`
    );
  }
}

console.log(failed === 0 ? '\nTodos los pares pasan AA.' : `\n${failed} pares por debajo de AA.`);
process.exit(failed === 0 ? 0 : 1);
