export const rgbaToHexAndAlpha = (rgba) => {
  if (!rgba || typeof rgba !== "string" || !rgba.startsWith("rgba")) {
    return { hex: "#ffffff", alpha: 0.05 };
  }

  const match = rgba.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i);

  if (!match) {
    return { hex: "#ffffff", alpha: 0.05 };
  }

  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  const a = match[4] !== undefined ? parseFloat(match[4]) : 0.05;

  return {
    hex:
      "#" +
      ((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1)
        .toLowerCase(),
    alpha: a,
  };
};

export const hexToRgba = (hex, alpha) => {
  if (!hex || typeof hex !== "string" || hex.charAt(0) !== "#") {
    return `rgba(0, 0, 0, ${alpha})`;
  }
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
