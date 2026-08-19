export const DEFAULT_THEME_COLOR = "#14532d";

const HEX_COLOR_REGEX = /^#(?:[0-9a-f]{3}){1,2}$/i;

const clampChannel = (value) => Math.min(255, Math.max(0, Math.round(value)));

const expandHexColor = (value) =>
  value.length === 4
    ? `#${value
        .slice(1)
        .split("")
        .map((char) => `${char}${char}`)
        .join("")}`
    : value;

const hexToRgb = (value) => {
  const normalized = expandHexColor(value);

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
};

const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b]
    .map((channel) => clampChannel(channel).toString(16).padStart(2, "0"))
    .join("")}`;

const mixHexColors = (sourceColor, targetColor, amount) => {
  const sourceRgb = hexToRgb(sourceColor);
  const targetRgb = hexToRgb(targetColor);

  return rgbToHex({
    r: sourceRgb.r + (targetRgb.r - sourceRgb.r) * amount,
    g: sourceRgb.g + (targetRgb.g - sourceRgb.g) * amount,
    b: sourceRgb.b + (targetRgb.b - sourceRgb.b) * amount,
  });
};

const getContrastColor = (value) => {
  const { r, g, b } = hexToRgb(value);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 160 ? "#0f172a" : "#ffffff";
};

export const isValidThemeColor = (value) =>
  typeof value === "string" && HEX_COLOR_REGEX.test(value.trim());

export const normalizeThemeColor = (value) =>
  isValidThemeColor(value)
    ? expandHexColor(value.trim()).toLowerCase()
    : DEFAULT_THEME_COLOR;

export const buildThemePalette = (value) => {
  const base = normalizeThemeColor(value);
  const { r, g, b } = hexToRgb(base);

  return {
    base,
    strong: mixHexColors(base, "#000000", 0.14),
    contrast: getContrastColor(base),
    soft: `rgba(${r}, ${g}, ${b}, 0.12)`,
    softer: `rgba(${r}, ${g}, ${b}, 0.18)`,
    border: `rgba(${r}, ${g}, ${b}, 0.26)`,
    shadow: `rgba(${r}, ${g}, ${b}, 0.3)`,
  };
};

const ensureThemeMetaTag = () => {
  let metaTag = document.querySelector('meta[name="theme-color"]');

  if (!metaTag) {
    metaTag = document.createElement("meta");
    metaTag.setAttribute("name", "theme-color");
    document.head.appendChild(metaTag);
  }

  return metaTag;
};

export const applyThemePalette = (value) => {
  const palette = buildThemePalette(value);
  const root = document.documentElement;

  root.style.setProperty("--brand-color", palette.base);
  root.style.setProperty("--brand-color-strong", palette.strong);
  root.style.setProperty("--brand-color-contrast", palette.contrast);
  root.style.setProperty("--brand-color-soft", palette.soft);
  root.style.setProperty("--brand-color-softer", palette.softer);
  root.style.setProperty("--brand-color-border", palette.border);
  root.style.setProperty("--brand-color-shadow", palette.shadow);

  ensureThemeMetaTag().setAttribute("content", palette.base);

  return palette;
};
