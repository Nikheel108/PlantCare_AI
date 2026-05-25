import { useState, useEffect } from "react";
import { Droplets, Power, Settings, TrendingUp, AlertTriangle, CheckCircle, Thermometer } from "lucide-react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { MiniSparkline } from "@/components/ui/MiniSparkline";
import { useEsp } from "@/contexts/EspContext";

export default function AutoWatering() {
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [isPumpActive, setIsPumpActive] = useState(false);
  const [soilMoisture, setSoilMoisture] = useState(45);
  const [isMistActive, setIsMistActive] = useState(false);
  const [pumpDuration, setPumpDuration] = useState(0);
  const [lastWatering, setLastWatering] = useState("2 hours ago");
  const [humidity, setHumidity] = useState(58);

  const { data, online } = useEsp();

  useEffect(() => {
    if (typeof data.pumpActive === "number") {
      const isActive = data.pumpActive === 1;
      setIsPumpActive((prev) => {
        if (!prev && isActive) setPumpDuration(5);
        if (!isActive) setPumpDuration(0);
        return isActive;
      });
    }
    if (typeof data.soilPercent === "number") {
      setSoilMoisture(Math.max(0, Math.min(100, Math.round(data.soilPercent))));
    } else if (typeof data.soilDry === "number") {
      setSoilMoisture(data.soilDry === 1 ? 25 : 70);
    }
    if (typeof data.mistActive === "number") setIsMistActive(data.mistActive === 1);
  }, [data]);

  // Removed random readings simulation

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPumpActive && pumpDuration > 0) {
      timer = setInterval(() => {
        setPumpDuration((prev) => {
          if (prev <= 1) { setIsPumpActive(false); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPumpActive, pumpDuration]);



  const getMoistureStatus = () => {
    if (soilMoisture < 30) return { status: "Low", badge: "bg-red-500/10 text-red-400 border-red-500/20" };
    if (soilMoisture < 60) return { status: "Moderate", badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" };
    return { status: "Good", badge: "bg-neon-green/10 text-neon-green border-neon-green/20" };
  };

  const ms = getMoistureStatus();
  const displayTemp = typeof data?.temperature === "number" ? data.temperature : 24.5;

  return (
    <DashboardLayout particles="water">
      <div className="relative h-full min-h-[70vh]">
        {!online && (
          <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md rounded-2xl bg-background/40 dark:bg-black/40 border border-border dark:border-white/5">
            <div className="text-center p-8 bg-background/80 dark:bg-black/60 border border-border dark:border-white/10 rounded-3xl max-w-sm backdrop-blur-xl shadow-2xl">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground dark:text-white mb-3">ESP is Offline</h2>
              <p className="text-muted-foreground dark:text-white/60 text-sm">Please connect or power on your ESP device to view and control the auto-watering system.</p>
            </div>
          </div>
        )}
        <div className={`transition-all duration-300 ${!online ? "opacity-30 blur-md pointer-events-none" : ""}`}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground dark:text-white mb-1">
          Auto-Watering <span className="text-neon">System</span>
        </h1>
        <p className="text-sm text-muted-foreground dark:text-white/35">
          Monitor soil moisture and control <strong className="text-foreground dark:text-white/55">irrigation automatically</strong>
        </p>
      </motion.div>

      {/* Top stat row with sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <GlassCard delay={0.1}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/[0.08] border border-cyan-500/20 flex items-center justify-center">
              <Droplets className="h-4 w-4 text-cyan-400" />
            </div>
            <MiniSparkline color="#22d3ee" />
          </div>
          <p className="text-xs text-white/30 mb-1">Soil Moisture</p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-heading font-bold text-white">{soilMoisture.toFixed(0)}%</span>
            <Badge className={`${ms.badge} border text-[10px] mb-1`}>{ms.status}</Badge>
          </div>
          <Progress value={soilMoisture} className="h-1.5 progress-neon" />
          <p className="text-[10px] text-white/15 mt-2">Optimal range: 40-80%</p>
        </GlassCard>

        <GlassCard delay={0.15}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/[0.08] border border-orange-500/20 flex items-center justify-center">
              <Thermometer className="h-4 w-4 text-orange-400" />
            </div>
            <MiniSparkline color="#fb923c" />
          </div>
          <p className="text-xs text-white/30 mb-1">Temperature</p>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-heading font-bold text-white">
              <AnimatedCounter target={displayTemp} decimals={1} />
            </span>
            <span className="text-lg text-white/30 mb-0.5">C</span>
          </div>
        </GlassCard>

        <GlassCard delay={0.2}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/[0.08] border border-blue-500/20 flex items-center justify-center">
              <Droplets className="h-4 w-4 text-blue-400" />
            </div>
            <MiniSparkline color="#60a5fa" />
          </div>
          <p className="text-xs text-white/30 mb-1">Humidity</p>
          <span className="text-3xl font-heading font-bold text-white">{humidity.toFixed(0)}%</span>
        </GlassCard>
      </div>

      {/* Control + Pump + Chart row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Control Panel */}
        <GlassCard delay={0.25}>
          <div className="flex items-center gap-2 mb-5">
            <Settings className="h-4 w-4 text-white/30" />
            <h3 className="text-sm font-heading font-semibold text-white">System Operation</h3>
          </div>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Strict Auto Mode</p>
                <p className="text-[11px] text-white/25">Hardware controlled via ESP32</p>
              </div>
              <Switch checked={true} disabled={true} />
            </div>
            <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4">
               <p className="text-xs text-white/50 leading-relaxed">
                 Manual overrides have been securely disabled. The ESP32 is running a strict <span className="text-white/80 font-medium">5s ON / 3s OFF</span> state-machine loop to perfectly optimize soil soaking and prevent overwatering.
               </p>
            </div>
          </div>
        </GlassCard>

        {/* Pump Status */}
        <GlassCard delay={0.3} glow={isPumpActive}>
          <div className="flex items-center gap-2 mb-5">
            <Power className="h-4 w-4 text-white/30" />
            <h3 className="text-sm font-heading font-semibold text-white">Pump Status</h3>
          </div>
          <div className="text-center mb-5">
            <motion.div
              animate={isPumpActive ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center border-2 transition-all duration-500 ${
                isPumpActive
                  ? "bg-neon-green/[0.06] border-neon-green/30 shadow-[0_0_30px_rgba(0,230,118,0.2)]"
                  : "bg-white/[0.02] border-white/[0.06]"
              }`}
            >
              <Power className={`h-8 w-8 ${isPumpActive ? "text-neon-green" : "text-white/15"}`} />
            </motion.div>
            <p className="text-base font-heading font-semibold text-white">{isPumpActive ? "Active" : "Inactive"}</p>
            {isPumpActive && <p className="text-xs text-neon-green mt-1">{pumpDuration}s remaining</p>}
          </div>
          <div className="space-y-2.5">
            {[
              { l: "Mode", v: isAutoMode ? "Auto" : "Manual" },
              { l: "Last Watering", v: lastWatering },
              { l: "Daily Usage", v: "2.3L" },
            ].map((r) => (
              <div key={r.l} className="flex justify-between text-xs border-b border-white/[0.03] pb-2 last:border-0">
                <span className="text-white/25">{r.l}</span>
                <span className="text-white/55 font-medium">{r.v}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Chart */}
        <GlassCard delay={0.35} className="md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-4 w-4 text-white/30" />
            <h3 className="text-sm font-heading font-semibold text-white">Moisture History</h3>
          </div>
          <div className="grid grid-cols-12 gap-1 h-28 items-end mb-2">
            {Array.from({ length: 12 }, (_, i) => {
              const h = Math.random() * 60 + 20;
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="w-full rounded-t-sm"
                  style={{ background: `linear-gradient(to top, rgba(0,230,118,0.1), rgba(0,230,118,${0.25 + h / 250}))` }}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[9px] text-white/15">
            {Array.from({ length: 7 }, (_, i) => <span key={i}>{i * 4}h</span>)}
          </div>
        </GlassCard>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard delay={0.4} hover={false} className="border-yellow-500/[0.06]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-heading font-semibold text-white mb-1">Low Moisture Alert</p>
              <p className="text-xs text-white/30">Soil moisture dropped below 35%. Auto-watering will activate soon.</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard delay={0.45} hover={false} className="border-neon-green/[0.06]">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-neon-green mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-heading font-semibold text-white mb-1">System Status</p>
              <p className="text-xs text-white/30">All sensors working properly. Last maintenance: 3 days ago.</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Hardware Setup */}
      <GlassCard delay={0.5} className="mt-4 border-white/[0.05]">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-full md:w-1/3 aspect-video relative rounded-xl overflow-hidden border border-white/10 bg-zinc-900">
            <img src="/images/mistbox-1.jpeg" alt="MISTBOX Setup" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-heading font-bold text-white mb-2">MISTBOX Hardware: Auto-Watering</h3>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Watch the physical MISTBOX unit for real-time operation feedback:
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-lg border border-white/[0.03]">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse" />
                <span className="text-sm text-white/80"><strong>Blue LED</strong> indicates the mist pump is currently active.</span>
              </li>
              <li className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-lg border border-white/[0.03]">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
                <span className="text-sm text-white/80"><strong>Yellow LED</strong> illuminates when soil moisture is critically low.</span>
              </li>
            </ul>
          </div>
        </div>
      </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}