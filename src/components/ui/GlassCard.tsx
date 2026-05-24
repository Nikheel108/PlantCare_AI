import { forwardRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  delay?: number;
  onClick?: () => void;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, hover = true, glow = false, delay = 0, onClick }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={
          hover
            ? {
                y: -6,
                transition: { duration: 0.25 },
              }
            : undefined
        }
        onClick={onClick}
        className={cn(
          "rounded-2xl p-6",
          "bg-white/[0.03] backdrop-blur-xl",
          "border border-white/[0.06]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_20px_rgba(0,230,118,0.05)]",
          "transition-all duration-300",
          hover && "cursor-pointer hover:border-[rgba(0,230,118,0.25)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4),0_0_30px_rgba(0,230,118,0.12)]",
          glow && "animate-glow-pulse",
          onClick && "cursor-pointer",
          className
        )}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";
