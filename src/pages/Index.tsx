import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Droplets, Camera, Wind, ArrowRight } from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background">
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
        <motion.span key={index} variants={child} className="inline-block text-foreground dark:text-white">
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
};

/* ═══════════════════════════════════════════
   4. SLEEK FEATURE BUTTON
   ═══════════════════════════════════════════ */
const SleekFeatureButton = ({ icon: Icon, title, desc, delay, onClick }: any) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      onClick={onClick}
      className="group flex flex-col text-left w-full p-6 rounded-3xl bg-accent/30 dark:bg-zinc-900/40 backdrop-blur-md border border-border dark:border-white/10 hover:bg-accent/50 dark:hover:bg-zinc-800/60 transition-all duration-300 shadow-sm hover:shadow-md"
    >
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-background/50 border border-border dark:border-white/5">
          <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground dark:text-white/60 dark:group-hover:text-white transition-colors" />
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-foreground dark:group-hover:text-white/80 group-hover:translate-x-1 transition-all duration-300" />
      </div>
      <h3 className="text-xl font-heading font-bold text-foreground dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground dark:text-white/60 leading-relaxed flex-1">
        {desc}
      </p>
    </motion.button>
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
    <div className="min-h-screen bg-background text-foreground relative font-sans selection:bg-[#00ff88]/30 selection:text-foreground hide-scrollbar">
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
          <span className="text-[19px] font-extrabold text-foreground dark:text-white tracking-wide" style={{ textShadow: "0 0 15px rgba(255,255,255,0.3)" }}>
            PlantCare AI
          </span>
        </motion.div>

        <div className="pointer-events-auto flex items-center gap-4">
          <ThemeToggle />
          <MagneticButton onClick={() => navigate("/login")}>
            <div className="px-7 py-2.5 rounded-full bg-foreground/5 dark:bg-white/5 border border-border dark:border-white/10 backdrop-blur-xl font-semibold text-foreground dark:text-white/90 hover:bg-foreground/10 dark:hover:bg-white/10 transition-colors shadow-[0_0_20px_rgba(0,0,0,0.05)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              Login
            </div>
          </MagneticButton>
        </div>
      </nav>

      {/* ═══ HERO & BENTO LAYOUT (max 100vh-120vh) ═══ */}
      <main className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        
        {/* Top Hero Content */}
        <div className="flex flex-col items-center text-center max-w-5xl w-full mb-16">
          <h1 className="text-6xl sm:text-7xl md:text-[6rem] lg:text-[8rem] font-black tracking-tighter leading-[1.1] mb-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1, type: "spring" }}
              className="inline-block drop-shadow-2xl"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-[#00f0ff] to-[#00ff88] bg-[length:200%_auto] animate-liquid-gradient">
                MISTBOX
              </span>
            </motion.div>
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="text-lg sm:text-xl text-muted-foreground dark:text-white/50 max-w-2xl font-medium leading-relaxed"
          >
            The apex of horticultural intelligence. Seamlessly merging IoT sensors, 
            neural vision diagnostics, and hyper-automated irrigation.
          </motion.p>
        </div>

        {/* MISTBOX Product Marquee (Full Width) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="w-screen max-w-none mb-24"
        >
          <div className="w-full overflow-hidden flex relative group/marquee py-6 bg-accent/30 dark:bg-white/[0.02] border-y border-border dark:border-white/[0.05] backdrop-blur-sm">
            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 25, ease: "linear", repeat: Infinity }}
              className="flex flex-nowrap group-hover/marquee:[animation-play-state:paused]"
            >
              {[1, 2, 3, 4, 5, 1, 2, 3, 4, 5].map((num, idx) => (
                <div key={idx} className="w-[280px] sm:w-[400px] md:w-[600px] flex-shrink-0 relative aspect-video rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-900 border border-black/10 dark:border-white/10 mx-3 sm:mx-4 group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                  <img 
                    src={`/images/mistbox-${num}.jpeg`} 
                    alt={`MISTBOX Setup ${num}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
        
        {/* Mist Sprayer Video Demo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 1 }}
          className="w-full max-w-5xl mb-24 px-4 sm:px-12"
        >
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-border dark:border-white/10 shadow-[0_0_40px_rgba(0,255,136,0.15)] mb-6">
            <video 
              autoPlay
              controls 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover bg-zinc-900/50"
              src="/mist-sprayer.mp4"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="text-center">
            <span className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-accent/30 dark:bg-zinc-900/40 backdrop-blur-md border border-border dark:border-white/10 font-medium text-sm text-foreground dark:text-white shadow-sm">
              Mist Sprayer Action
            </span>
          </div>
        </motion.div>

        {/* Parts Description Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="w-full max-w-4xl mb-24 px-4 sm:px-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left relative">
            {/* Background blur highlight */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-md bg-[#00ff88]/5 blur-[100px] pointer-events-none rounded-full"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-3">
                <div className="w-1.5 h-8 rounded-full bg-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.5)]"></div>
                Hardware Setup
              </h2>
              <div className="space-y-4">
                <div className="bg-accent/30 dark:bg-white/[0.02] border border-border dark:border-white/[0.05] rounded-2xl p-5 transition-colors hover:border-[#00ff88]/20 group">
                  <h3 className="text-lg font-bold text-foreground dark:text-white mb-2 flex items-center gap-2 group-hover:text-[#00ff88] transition-colors">
                    <span className="text-[#00ff88] font-mono text-sm opacity-50">01</span> Core Controller
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-white/50 leading-relaxed">The brain of MISTBOX. This powerful ESP32 microcontroller handles Wi-Fi communications, sensor data processing, and coordinates the autonomous functions.</p>
                </div>
                <div className="bg-accent/30 dark:bg-white/[0.02] border border-border dark:border-white/[0.05] rounded-2xl p-5 transition-colors hover:border-[#00ff88]/20 group">
                  <h3 className="text-lg font-bold text-foreground dark:text-white mb-2 flex items-center gap-2 group-hover:text-[#00ff88] transition-colors">
                    <span className="text-[#00ff88] font-mono text-sm opacity-50">02</span> DHT11 Sensor
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-white/50 leading-relaxed">Monitors ambient temperature and humidity in real-time, providing crucial climate data to ensure optimal growing conditions.</p>
                </div>
                <div className="bg-accent/30 dark:bg-white/[0.02] border border-border dark:border-white/[0.05] rounded-2xl p-5 transition-colors hover:border-[#00ff88]/20 group">
                  <h3 className="text-lg font-bold text-foreground dark:text-white mb-2 flex items-center gap-2 group-hover:text-[#00ff88] transition-colors">
                    <span className="text-[#00ff88] font-mono text-sm opacity-50">03</span> Mist Pump Module
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-white/50 leading-relaxed">A high-efficiency micro water pump connected via a dedicated relay, providing precise irrigation based on real-time soil telemetry.</p>
                </div>
              </div>
            </div>
            <div className="pt-0 md:pt-14 space-y-4 relative z-10">
              <div className="bg-accent/30 dark:bg-white/[0.02] border border-border dark:border-white/[0.05] rounded-2xl p-5 transition-colors hover:border-[#00ff88]/20 group">
                <h3 className="text-lg font-bold text-foreground dark:text-white mb-2 flex items-center gap-2 group-hover:text-[#00ff88] transition-colors">
                  <span className="text-[#00ff88] font-mono text-sm opacity-50">04</span> MQ135 Air Quality Sensor
                </h3>
                <p className="text-sm text-muted-foreground dark:text-white/50 leading-relaxed">Continuously analyzes environmental gases to determine the Air Quality Index (AQI), warning you of harmful atmospheric conditions.</p>
              </div>
              <div className="bg-accent/30 dark:bg-white/[0.02] border border-border dark:border-white/[0.05] rounded-2xl p-5 transition-colors hover:border-[#00ff88]/20 group">
                <h3 className="text-lg font-bold text-foreground dark:text-white mb-2 flex items-center gap-2 group-hover:text-[#00ff88] transition-colors">
                  <span className="text-[#00ff88] font-mono text-sm opacity-50">05</span> HW-080 Soil Probe
                </h3>
                <p className="text-sm text-muted-foreground dark:text-white/50 leading-relaxed">Sub-surface moisture telemetry sensor that detects precise hydration levels, ensuring your plants only get water when they truly need it.</p>
              </div>
              <div className="bg-accent/30 dark:bg-white/[0.02] border border-border dark:border-white/[0.05] rounded-2xl p-5 transition-colors hover:border-[#00ff88]/20 group">
                <h3 className="text-lg font-bold text-foreground dark:text-white mb-2 flex items-center gap-2 group-hover:text-[#00ff88] transition-colors">
                  <span className="text-[#00ff88] font-mono text-sm opacity-50">06</span> LED Indicator Array
                </h3>
                <p className="text-sm text-muted-foreground dark:text-white/50 leading-relaxed">Instantly read the system state without a screen. Blue (Pump Active), Yellow (Low Moisture), Red (Alert/Disease), and Green (AQI Status).</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Business Model Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 1 }}
          className="w-full max-w-5xl mb-24 px-4 sm:px-12"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#00f0ff]">Business Model</span> & Economics
            </h2>
            <p className="text-muted-foreground dark:text-white/50 max-w-2xl mx-auto">
              Disrupting the agritech landscape with an ultra-affordable hardware ecosystem powered by a high-value SaaS subscription.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pricing Breakdown */}
            <div className="bg-accent/30 dark:bg-zinc-900/40 border border-border dark:border-white/10 rounded-3xl p-8 backdrop-blur-md">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                Hardware BOM <Badge variant="secondary" className="bg-[#00ff88]/10 text-[#00ff88] border-none ml-2">Ultra-Low Cost</Badge>
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-border/50 dark:border-white/5 pb-3">
                  <span className="text-muted-foreground dark:text-white/70">ESP32 Core Controller</span>
                  <span className="font-mono font-medium">~₹350</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 dark:border-white/5 pb-3">
                  <span className="text-muted-foreground dark:text-white/70">DHT11 (Temp/Humidity)</span>
                  <span className="font-mono font-medium">~₹120</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 dark:border-white/5 pb-3">
                  <span className="text-muted-foreground dark:text-white/70">MQ135 (Air Quality)</span>
                  <span className="font-mono font-medium">~₹160</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 dark:border-white/5 pb-3">
                  <span className="text-muted-foreground dark:text-white/70">HW-080 (Soil Probe)</span>
                  <span className="font-mono font-medium">~₹80</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 dark:border-white/5 pb-3">
                  <span className="text-muted-foreground dark:text-white/70">Mist Pump & Relay</span>
                  <span className="font-mono font-medium">~₹400</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 dark:border-white/5 pb-3">
                  <span className="text-muted-foreground dark:text-white/70">PCB & Enclosure</span>
                  <span className="font-mono font-medium">~₹490</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-lg">Total Cost to Build</span>
                  <span className="font-mono font-bold text-xl text-[#00ff88]">~₹1,600</span>
                </div>
              </div>
            </div>

            {/* Business Plan */}
            <div className="flex flex-col gap-6">
              <div className="bg-accent/30 dark:bg-zinc-900/40 border border-border dark:border-white/10 rounded-3xl p-8 backdrop-blur-md flex-1">
                <h3 className="text-xl font-bold mb-4">The Strategy</h3>
                <p className="text-sm text-muted-foreground dark:text-white/60 leading-relaxed mb-6">
                  We operate on a "Razor and Blades" model. By keeping the barrier to entry extremely low with affordable hardware, we rapidly capture market share across B2C (home gardeners) and B2B (commercial greenhouses). The true revenue engine is our PlantCare AI+ software subscription.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-background/50 border border-border/50 dark:border-white/5">
                    <div className="text-xs text-muted-foreground mb-1">Retail Price</div>
                    <div className="text-2xl font-bold text-foreground dark:text-white">₹3,999</div>
                    <div className="text-[10px] text-[#00ff88] mt-1">+60% Hardware Margin</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#00ff88]/10 border border-[#00ff88]/20">
                    <div className="text-xs text-muted-foreground mb-1 dark:text-white/70">SaaS Subscription</div>
                    <div className="text-2xl font-bold text-[#00ff88]">₹399<span className="text-sm font-normal">/mo</span></div>
                    <div className="text-[10px] text-[#00ff88] mt-1">~90% Software Margin</div>
                  </div>
                </div>
              </div>
              <div className="bg-accent/30 dark:bg-zinc-900/40 border border-border dark:border-white/10 rounded-3xl p-6 backdrop-blur-md flex items-center justify-between">
                <div>
                  <h4 className="font-bold">PlantCare AI+ Features</h4>
                  <p className="text-xs text-muted-foreground dark:text-white/50 mt-1">Unlimited disease scans & predictive yield analytics</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center shadow-lg">
                  <ArrowRight className="h-4 w-4 text-[#00ff88]" />
                </div>
              </div>
            </div>
          </div>

          {/* Future Enhancements & Novelty */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-accent/20 dark:bg-zinc-900/30 border border-border dark:border-white/5 rounded-3xl p-8 backdrop-blur-md hover:border-[#00ff88]/30 transition-colors">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 rounded-full bg-[#00ff88]"></div>
                Novelty & Widespread Usage
              </h3>
              <p className="text-sm text-muted-foreground dark:text-white/60 leading-relaxed">
                Existing agritech solutions often focus narrowly on a single plant or restrictive environment. We are building a product designed for infinite scalability—whether it's deployed in commercial nurseries or sprawling home gardens. Our modular approach means the Auto Watering system and the AQI/Sprinkler system can function completely independently, or assemble together to enable a widespread, robust agricultural usage model for multiple plants simultaneously.
              </p>
            </div>
            
            <div className="bg-accent/20 dark:bg-zinc-900/30 border border-border dark:border-white/5 rounded-3xl p-8 backdrop-blur-md hover:border-[#00ff88]/30 transition-colors">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 rounded-full bg-[#00ff88]"></div>
                Future Enhancements
              </h3>
              <ul className="text-sm text-muted-foreground dark:text-white/60 leading-relaxed space-y-3">
                <li className="flex gap-2"><ArrowRight className="h-4 w-4 text-[#00ff88] shrink-0 mt-0.5" /> <span><strong>Mesh Networking:</strong> Deploy dozens of MISTBOX nodes that communicate with each other over localized mesh networks.</span></li>
                <li className="flex gap-2"><ArrowRight className="h-4 w-4 text-[#00ff88] shrink-0 mt-0.5" /> <span><strong>Drone Integration:</strong> Automated aerial disease scanning syncing directly with ground-level MISTBOX irrigation logic.</span></li>
                <li className="flex gap-2"><ArrowRight className="h-4 w-4 text-[#00ff88] shrink-0 mt-0.5" /> <span><strong>Advanced Spectrometry:</strong> Integration of hyper-spectral cameras for early-stage nutrient deficiency detection.</span></li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Sleek Feature Buttons */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {features.map((feat, i) => (
            <SleekFeatureButton 
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
