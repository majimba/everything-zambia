// Theme engine for Everything Zambia color palette viewer

const themePresets = {
  primaryLight: {
    name: 'Primary • Light',
    vars: { '--bg': '#FFFFFF', '--text': '#000000', '--muted': '#424449', '--card': '#FFFFFF', '--accent': '#EF7D00', '--link': '#2E4374', '--border': '#E5E5E5' }
  },
  primaryCream: {
    name: 'Primary • Cream',
    vars: { '--bg': '#F5F5DC', '--text': '#000000', '--muted': '#424449', '--card': '#FFFFFF', '--accent': '#EF7D00', '--link': '#2E4374', '--border': '#E5E5E5' }
  },
  primaryDark: {
    name: 'Primary • Dark',
    vars: { '--bg': '#36454F', '--text': '#FFFFFF', '--muted': '#F5F5DC', '--card': '#424449', '--accent': '#198A00', '--link': '#EF7D00', '--border': '#58656F' }
  },
  secondaryEarth: {
    name: 'Secondary • Earth',
    vars: { '--bg': '#C4B998', '--text': '#424449', '--muted': '#2E4374', '--card': '#FFFFFF', '--accent': '#2E4374', '--link': '#008080', '--border': '#D9D2BF' }
  },
  tertiaryModern: {
    name: 'Tertiary • Modern',
    vars: { '--bg': '#FFFFFF', '--text': '#424449', '--muted': '#000000', '--card': '#FFFFFF', '--accent': '#008080', '--link': '#FFC107', '--border': '#E5E5E5' }
  }
};

function applyThemeVars(vars) {
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  localStorage.setItem('ez_theme', JSON.stringify(vars));
  updateContrastBadge();
}

function applyTheme(id) {
  const preset = themePresets[id];
  if (!preset) return;
  applyThemeVars(preset.vars);
}

function hexToRgb(hex) {
  const s = hex.replace('#', '');
  const bigint = parseInt(s, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function luminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrastRatio(hex1, hex2) {
  const c1 = hexToRgb(hex1), c2 = hexToRgb(hex2);
  const L1 = luminance(c1.r, c1.g, c1.b) + 0.05;
  const L2 = luminance(c2.r, c2.g, c2.b) + 0.05;
  return L1 > L2 ? (L1 / L2) : (L2 / L1);
}

function getVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function updateContrastBadge() {
  const bg = getVar('--bg') || '#FFFFFF';
  const text = getVar('--text') || '#000000';
  const ratio = contrastRatio(bg, text);
  const badge = document.getElementById('contrast');
  if (!badge) return;
  const ratioStr = ratio.toFixed(2);
  let level = 'AA';
  if (ratio >= 7) level = 'AAA';
  else if (ratio < 4.5) level = 'LOW';
  badge.textContent = `Contrast ${ratioStr} (${level})`;
}

function renderThemeChips() {
  const holder = document.getElementById('theme-presets');
  if (!holder) return;
  holder.innerHTML = '';
  Object.entries(themePresets).forEach(([id, preset]) => {
    const chip = document.createElement('button');
    chip.className = 'theme-chip';
    chip.textContent = preset.name;
    chip.onclick = () => applyTheme(id);
    holder.appendChild(chip);
  });
}

function copyText(text) {
  navigator.clipboard && navigator.clipboard.writeText(text);
}

function setupExportButtons() {
  const cssBtn = document.getElementById('copy-css');
  const jsonBtn = document.getElementById('copy-json');
  if (cssBtn) cssBtn.onclick = () => {
    const vars = ['--bg','--text','--muted','--card','--accent','--link','--border']
      .map(k => `  ${k}: ${getVar(k)};`).join('\n');
    copyText(`:root{\n${vars}\n}`);
    cssBtn.textContent = 'Copied';
    setTimeout(() => cssBtn.textContent = 'Copy CSS', 1000);
  };
  if (jsonBtn) jsonBtn.onclick = () => {
    const obj = {
      bg: getVar('--bg'), text: getVar('--text'), muted: getVar('--muted'), card: getVar('--card'),
      accent: getVar('--accent'), link: getVar('--link'), border: getVar('--border')
    };
    copyText(JSON.stringify(obj, null, 2));
    jsonBtn.textContent = 'Copied';
    setTimeout(() => jsonBtn.textContent = 'Copy JSON', 1000);
  };
}

function restoreTheme() {
  try {
    const saved = JSON.parse(localStorage.getItem('ez_theme'));
    if (saved) applyThemeVars(saved);
  } catch {}
}

document.addEventListener('DOMContentLoaded', () => {
  renderThemeChips();
  setupExportButtons();
  restoreTheme();
  updateContrastBadge();
});

// Allow canvas to call this to update variables dynamically
window.applyThemeVars = applyThemeVars;

