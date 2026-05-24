import { useMemo } from "react";
import { motion } from "framer-motion";

interface MiniSparklineProps {
  data?: number[];
  width?: number;
  height?: number;
  color?: string;
  filled?: boolean;
}

export function MiniSparkline({
  data,
  width = 80,
  height = 32,
  color = "#00e676",
  filled = true,
}: MiniSparklineProps) {
  const points = useMemo(() => {
    const values = data || Array.from({ length: 12 }, () => Math.random() * 60 + 20);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const stepX = width / (values.length - 1);
    return values.map((v, i) => ({
      x: i * stepX,
      y: height - ((v - min) / range) * (height - 4) - 2,
    }));
  }, [data, width, height]);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="flex-shrink-0">
      {filled && (
        <motion.path
          d={areaPath}
          fill={`url(#sparkGrad-${color.replace("#", "")})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
      )}
      <motion.path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <defs>
        <linearGradient id={`sparkGrad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}
