import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Droplets, Camera, Wind, ArrowRight } from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import plantLogo from "@/assets/plant-logo.png";
import { useAuth } from "@/contexts/AuthContext";

/* ═══════════════════════════════════════════
   1. GLOBAL BACKGROUND (Aurora, Grid Mask, Spotlight)
   ═══════════════════════════════════════════ */
const Background = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-zinc-950">
      {/* Aurora Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 80, -40, 0],
          y: [0, -60, 40, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full opacity-30 mix-blend-screen blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(0,255,136,0.15) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 0.9, 1],
          x: [0, -60, 60, 0],
          y: [0, 80, -30, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full opacity-20 mix-blend-screen blur-[140px]"
        style={{ background: "radial-gradient(circle, rgba(0,240,255,0.12) 0%, transparent 70%)" }}
      />

      {/* Retro Grid / Dot Pattern Mask */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.15) 1.5px, transparent 1.5px)`,
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 100%)",
        }}
      />

      {/* Interactive Cursor Sparkle / Spotlight */}
      <motion.div
        className="absolute -inset-px transition-opacity duration-300 opacity-60"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) =>
              `radial-gradient(500px circle at ${x}px ${y}px, rgba(0,255,136,0.06), transparent 80%)`
          ),
        }}
      />
    </div>
  );
};

/* ═══════════════════════════════════════════
   2. MAGNETIC BUTTON
   ═══════════════════════════════════════════ */
const MagneticButton = ({ children, onClick, className = "" }: any) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 200, damping: 15, mass: 0.2 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.4);
    y.set((e.clientY - centerY) * 0.4);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative inline-block cursor-pointer ${className}`}
    >
      {children}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   3. LETTER-BY-LETTER SPRING REVEAL
   ═══════════════════════════════════════════ */
const SparkleTextReveal = ({ text }: { text: string }) => {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
  };

  const child = {
    hidden: { opacity: 0, y: 40, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { type: "spring", damping: 12, stiffness: 200 } 
    },
  };

  return (
    <motion.span variants={container} initial="hidden" animate="visible" className="inline-block">
      {text.split("").map((char, index) => (
        <motion.span key={index} variants={child} className="inline-block text-white">
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
};

/* ═══════════════════════════════════════════
   4. HYPER-INTERACTIVE "BENTO" TILT CARD
   ═══════════════════════════════════════════ */
const BentoCard = ({ icon: Icon, title, desc, delay, onClick }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Physics values for tilt and glare
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 300, damping: 30, mass: 0.5 };
  
  // Map mouse position to rotation (max 15 degrees)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], ["15deg", "-15deg"]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], ["-15deg", "15deg"]), springConfig);
  
  // Glare position
  const glareX = useSpring(useTransform(x, [-0.5, 0.5], ["100%", "0%"]), springConfig);
  const glareY = useSpring(useTransform(y, [-0.5, 0.5], ["100%", "0%"]), springConfig);
  const glareOpacity = useSpring(useTransform(y, [-0.5, 0.5], [0, 0.2]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative w-full h-[340px] group cursor-pointer perspective-1000"
    >
      {/* Outer wrapper for Meteor Glow Border */}
      <div className="absolute inset-0 rounded-3xl bg-zinc-900/50 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        
        {/* Spinning Meteor Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] h-[250%] bg-[conic-gradient(transparent,transparent_30%,#00ff88_45%,#00f0ff_55%,transparent_70%)] animate-[spin_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Evervault / Dark Glass Card (1px inset to reveal border) */}
        <div 
          className="absolute inset-[1px] rounded-3xl bg-zinc-950/90 backdrop-blur-xl flex flex-col p-8 transition-colors duration-300 group-hover:bg-zinc-950/70 overflow-hidden"
          style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
        >
          {/* Static subtle border when not hovered */}
          <div className="absolute inset-0 rounded-3xl border border-white/10 group-hover:border-transparent transition-colors duration-300 pointer-events-none" />

          {/* 3D Dynamic Glare overlay */}
          <motion.div 
            className="absolute inset-0 pointer-events-none rounded-3xl"
            style={{
              background: "radial-gradient(circle at center, white, transparent)",
              opacity: glareOpacity,
              left: glareX,
              top: glareY,
              transform: "translate(-50%, -50%) scale(2)",
              mixBlendMode: "overlay"
            }}
          />

          {/* Content Shift: Icon pops up and drops shadow */}
          <div 
            className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 transition-all duration-500 ease-out group-hover:-translate-y-[10px] group-hover:shadow-[0_15px_30px_rgba(0,255,136,0.3)] group-hover:border-[#00ff88]/40 group-hover:bg-[#00ff88]/10"
            style={{ transform: "translateZ(60px)" }}
          >
            <Icon className="h-7 w-7 text-white/70 group-hover:text-[#00ff88] transition-colors duration-500" />
          </div>
          
          <h3 
            className="text-2xl font-heading font-bold text-white mb-3"
            style={{ transform: "translateZ(30px)" }}
          >
            {title}
          </h3>
          <p 
            className="text-[15px] text-white/50 leading-relaxed font-medium mb-8 flex-1"
            style={{ transform: "translateZ(20px)" }}
          >
            {desc}
          </p>

          {/* Content Shift: Launch text turns into glowing pill */}
          <div 
            className="mt-auto flex items-center transition-all duration-500 ease-out"
            style={{ transform: "translateZ(40px)" }}
          >
            <div className="inline-flex items-center gap-2 text-sm font-bold text-white/50 group-hover:text-[#00ff88] group-hover:bg-[#00ff88]/10 group-hover:px-5 group-hover:py-2.5 group-hover:rounded-full group-hover:border group-hover:border-[#00ff88]/30 group-hover:shadow-[0_0_15px_rgba(0,255,136,0.2)] transition-all duration-500">
              Launch 
              <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */
const features = [
  {
    icon: Droplets,
    title: "Auto Watering",
    desc: "Autonomous irrigation powered by real-time soil telemetry and intelligent thresholds.",
    href: "/watering",
  },
  {
    icon: Camera,
    title: "Disease Vision",
    desc: "AI neural network processing for instantaneous leaf pathology diagnosis.",
    href: "/detection",
  },
  {
    icon: Wind,
    title: "Air Quality",
    desc: "High-fidelity environmental sensing for localized atmospheric intelligence.",
    href: "/aqi",
  },
];

/* ═══════════════════════════════════════════
   MAIN HERO PAGE
   ═══════════════════════════════════════════ */
const Index = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) navigate("/dashboard");
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative font-sans selection:bg-[#00ff88]/30 selection:text-white hide-scrollbar">
      <Background />

      {/* ═══ MAGNETIC NAVIGATION ═══ */}
      <nav className="absolute top-0 z-50 w-full px-8 py-6 flex items-center justify-between pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex items-center gap-3 pointer-events-auto"
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[#00ff88] blur-2xl opacity-40 rounded-full" />
            <img src={plantLogo} alt="Logo" className="h-8 w-8 relative z-10" />
          </div>
          <span className="text-[19px] font-extrabold text-white tracking-wide" style={{ textShadow: "0 0 15px rgba(255,255,255,0.3)" }}>
            PlantCare AI
          </span>
        </motion.div>

        <div className="pointer-events-auto">
          <MagneticButton onClick={() => navigate("/login")}>
            <div className="px-7 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-colors shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              Login
            </div>
          </MagneticButton>
        </div>
      </nav>

      {/* ═══ HERO & BENTO LAYOUT (max 100vh-120vh) ═══ */}
      <main className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        
        {/* Top Hero Content */}
        <div className="flex flex-col items-center text-center max-w-5xl w-full mb-16">
          <h1 className="text-6xl sm:text-7xl md:text-[6rem] lg:text-[7.5rem] font-black tracking-tighter leading-[1.1] mb-6">
            <div className="block mb-2 drop-shadow-2xl">
              <SparkleTextReveal text="Smart Balcony" />
            </div>
            
            {/* Liquid Gradient Text */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1, type: "spring" }}
              className="inline-block"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-[#00f0ff] to-[#00ff88] bg-[length:200%_auto] animate-liquid-gradient drop-shadow-lg">
                System
              </span>
            </motion.div>
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="text-lg sm:text-xl text-white/50 max-w-2xl font-medium leading-relaxed"
          >
            The apex of horticultural intelligence. Seamlessly merging IoT sensors, 
            neural vision diagnostics, and hyper-automated irrigation.
          </motion.p>
        </div>

        {/* Hyper-Interactive Bento Cards */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feat, i) => (
            <BentoCard 
              key={feat.title}
              {...feat}
              delay={1.5 + (i * 0.15)}
              onClick={() => navigate(feat.href)}
            />
          ))}
        </div>
      </main>

      {/* Global Advanced CSS */}
      <style>{`
        /* Liquid Gradient Animation */
        @keyframes liquid-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-liquid-gradient {
          animation: liquid-gradient 5s ease-in-out infinite;
        }

        /* 3D Physics Requirements */
        .perspective-1000 {
          perspective: 1000px;
        }

        /* Hide Scrollbar strictly */
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Index;
