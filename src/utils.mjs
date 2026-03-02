export const rgbaToHexAndAlpha = (rgba) => {
  if (!rgba || typeof rgba !== "string" || !rgba.startsWith("rgba")) {
    return { hex: "#ffffff", alpha: 0.05 };
  }
  const clean = rgba
    .replace("rgba(", "")
    .replace(")", "")
    .split(",")
    .map((s) => s.trim());

  const r = clean[0] !== "" && !isNaN(clean[0]) ? parseInt(clean[0]) : 255;
  const g = clean[1] !== "" && !isNaN(clean[1]) ? parseInt(clean[1]) : 255;
  const b = clean[2] !== "" && !isNaN(clean[2]) ? parseInt(clean[2]) : 255;
  const a = clean[3] !== "" && !isNaN(clean[3]) ? parseFloat(clean[3]) : 0.05;

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
