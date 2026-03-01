export const rgbaToHexAndAlpha = (rgba) => {
  if (!rgba || !rgba.startsWith("rgba")) return { hex: "#ffffff", alpha: 0.05 };
  const clean = rgba
    .replace("rgba(", "")
    .replace(")", "")
    .split(",")
    .map((s) => s.trim());
  const r = parseInt(clean[0]) || 255;
  const g = parseInt(clean[1]) || 255;
  const b = parseInt(clean[2]) || 255;
  const a = parseFloat(clean[3]) || 0.05;
  return {
    hex: "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1),
    alpha: a,
  };
};

export const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
