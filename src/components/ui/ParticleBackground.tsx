import { useCallback, useMemo } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine";

type ParticleVariant = "default" | "water" | "leaf" | "air";

interface ParticleBackgroundProps {
  variant?: ParticleVariant;
  className?: string;
}

const variantConfigs: Record<ParticleVariant, Partial<ISourceOptions>> = {
  default: {
    particles: {
      color: { value: ["#00e676", "#4caf50", "#69f0ae"] },
      links: {
        enable: true,
        color: "#00e676",
        opacity: 0.08,
        distance: 150,
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.6,
        direction: "none",
        outModes: { default: "out" },
      },
      number: { value: 50, density: { enable: true } },
      opacity: { value: { min: 0.1, max: 0.3 } },
      size: { value: { min: 1, max: 3 } },
      shape: { type: "circle" },
    },
  },
  water: {
    particles: {
      color: { value: ["#00bcd4", "#26c6da", "#4dd0e1", "#00e5ff"] },
      links: { enable: false },
      move: {
        enable: true,
        speed: 1.5,
        direction: "bottom",
        outModes: { default: "out" },
        straight: false,
      },
      number: { value: 40, density: { enable: true } },
      opacity: { value: { min: 0.1, max: 0.4 } },
      size: { value: { min: 1, max: 4 } },
      shape: { type: "circle" },
    },
  },
  leaf: {
    particles: {
      color: { value: ["#00e676", "#4caf50", "#81c784", "#a5d6a7"] },
      links: { enable: false },
      move: {
        enable: true,
        speed: 0.4,
        direction: "none",
        outModes: { default: "out" },
      },
      number: { value: 30, density: { enable: true } },
      opacity: { value: { min: 0.08, max: 0.25 } },
      size: { value: { min: 2, max: 6 } },
      shape: { type: "circle" },
      rotate: {
        value: { min: 0, max: 360 },
        animation: { enable: true, speed: 3 },
      },
    },
  },
  air: {
    particles: {
      color: { value: ["#ffffff", "#e0e0e0", "#b0bec5", "#90a4ae"] },
      links: { enable: false },
      move: {
        enable: true,
        speed: 1.2,
        direction: "right",
        outModes: { default: "out" },
        straight: false,
      },
      number: { value: 35, density: { enable: true } },
      opacity: { value: { min: 0.05, max: 0.2 } },
      size: { value: { min: 1, max: 3 } },
      shape: { type: "circle" },
    },
  },
};

export function ParticleBackground({ variant = "default", className = "" }: ParticleBackgroundProps) {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: false,
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: { enable: true, mode: "grab" },
        },
        modes: {
          grab: { distance: 140, links: { opacity: 0.15 } },
        },
      },
      detectRetina: true,
      ...variantConfigs[variant],
    }),
    [variant]
  );

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      <Particles
        id={`particles-${variant}`}
        init={particlesInit}
        options={options}
        className="w-full h-full"
      />
    </div>
  );
}
