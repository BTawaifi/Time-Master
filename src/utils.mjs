export const rgbaToHexAndAlpha = (rgba) => {
  if (!rgba || typeof rgba !== "string" || !rgba.startsWith("rgba")) {
    return { hex: "#ffffff", alpha: 0.05 };
  }

  let r = 255, g = 255, b = 255, a = 0.05;
  let part = 0;
  let currentStart = -1;

  let i = 4;
  if (rgba.charCodeAt(4) === 40) i = 5; // '(' is 40

  const len = rgba.length;
  for (; i < len; i++) {
    const charCode = rgba.charCodeAt(i);
    // 32 is space, 41 is ')'
    if (charCode === 32 || charCode === 41) {
      if (currentStart !== -1) {
          const val = rgba.substring(currentStart, i);
          if (val !== "" && !isNaN(val)) {
            if (part === 0) r = parseInt(val, 10);
            else if (part === 1) g = parseInt(val, 10);
            else if (part === 2) b = parseInt(val, 10);
            else if (part === 3) a = parseFloat(val);
          }
          currentStart = -1;
      }
      continue;
    }

    // 44 is ','
    if (charCode === 44) {
      if (currentStart !== -1) {
          const val = rgba.substring(currentStart, i);
          if (val !== "" && !isNaN(val)) {
            if (part === 0) r = parseInt(val, 10);
            else if (part === 1) g = parseInt(val, 10);
            else if (part === 2) b = parseInt(val, 10);
            else if (part === 3) a = parseFloat(val);
          }
          currentStart = -1;
      }
      part++;
      if (part > 3) break;
    } else {
      if (currentStart === -1) {
        currentStart = i;
      }
    }
  }

  if (currentStart !== -1 && part <= 3) {
      const val = rgba.substring(currentStart);
      if (val !== "" && !isNaN(val)) {
        if (part === 0) r = parseInt(val, 10);
        else if (part === 1) g = parseInt(val, 10);
        else if (part === 2) b = parseInt(val, 10);
        else if (part === 3) a = parseFloat(val);
      }
  }

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
