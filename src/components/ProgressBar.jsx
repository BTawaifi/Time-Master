import React from "react";

export const ProgressBar = ({ value, colorClass }) => {
  return (
    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
      <div
        className={`h-full ${colorClass}`}
        style={{
          width: `${(value / 10) * 100}%`,
        }}
      ></div>
    </div>
  );
};
