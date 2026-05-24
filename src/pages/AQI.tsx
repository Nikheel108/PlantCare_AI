import { useState, useEffect } from "react";
import { Wind, Thermometer, Droplets, Activity, AlertTriangle, CheckCircle, Heart, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { MiniSparkline } from "@/components/ui/MiniSparkline";
import { useEsp } from "@/contexts/EspContext";

function getAQIStatus(aqi: number) {
  if (aqi <= 50) return { label: "Good", color: "#00e676", text: "text-neon-green", desc: "Air quality is excellent" };
  if (aqi <= 100) return { label: "Moderate", color: "#ffeb3b", text: "text-yellow-400", desc: "Acceptable air quality" };
  if (aqi <= 150) return { label: "Unhealthy (Sensitive)", color: "#ff9800", text: "text-orange-400", desc: "Sensitive groups affected" };
  if (aqi <= 200) return { label: "Unhealthy", color: "#f44336", text: "text-red-400", desc: "Health effects possible" };
  return { label: "Hazardous", color: "#9c27b0", text: "text-purple-400", desc: "Emergency conditions" };
}

function AQIGauge({ value, max = 300 }: { value: number; max?: number }) {
  const st = getAQIStatus(value);
  const pct = Math.min((value / max) * 100, 100);
  const circ = 2 * Math.PI * 80;
  const off = circ - (pct / 100) * circ * 0.75;
  return (
    <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-[135deg]">
        <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} />
        <motion.circle cx="100" cy="100" r="80" fill="none" stroke={st.color} strokeWidth="10" strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: off }} transition={{ duration: 1.2, ease: "easeOut" }} style={{ filter: `drop-shadow(0 0 6px ${st.color}40)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl sm:text-4xl font-heading font-bold text-white"><AnimatedCounter target={value} duration={1.2} /></span>
        <span className="text-[10px] text-white/25 mt-0.5">AQI</span>
        <Badge className={`mt-1.5 text-[9px] border ${value <= 50 ? "bg-neon-green/10 text-neon-green border-neon-green/20" : value <= 100 ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : value <= 150 ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : value <= 200 ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"}`}>{st.label}</Badge>
      </div>
    </div>
  );
}

export default function AQI() {
  const { data, online } = useEsp();
  const [aqiValue, setAqiValue] = useState(42);
  const [temperature, setTemperature] = useState(24.5);
  const [humidity, setHumidity] = useState(58);

  useEffect(() => {
    if (typeof data?.aqi === "number") setAqiValue(data.aqi);
    if (typeof data?.temperature === "number") setTemperature(data.temperature);
  }, [data]);

  // Removed random readings simulation

  const st = getAQIStatus(Math.round(aqiValue));
  const tips = aqiValue <= 50
    ? ["Air quality is excellent. Perfect for outdoor activities.", "Open balcony vents for fresh air.", "Great time to tend to your plants outdoors."]
    : aqiValue <= 100
    ? ["Acceptable for most individuals.", "Sensitive individuals should limit outdoor exertion.", "Consider running an air purifier if symptoms appear."]
    : ["Reduce prolonged outdoor activities.", "Close balcony vents to limit exposure.", "Consider using an air purifier.", "Monitor symptoms: coughing, irritation, breathing difficulty."];

  return (
    <DashboardLayout particles="air">
      <div className="relative h-full min-h-[70vh]">
        {!online && (
          <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md rounded-2xl bg-black/40 border border-white/5">
            <div className="text-center p-8 bg-black/60 border border-white/10 rounded-3xl max-w-sm backdrop-blur-xl shadow-2xl">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-3">ESP is Offline</h2>
              <p className="text-white/60 text-sm">Please connect or power on your ESP device to view real-time air quality data.</p>
            </div>
          </div>
        )}
        <div className={`transition-all duration-300 ${!online ? "opacity-30 blur-md pointer-events-none" : ""}`}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-1">
          Air Quality <span className="text-neon">Monitor</span>
        </h1>
        <p className="text-sm text-white/35">Real-time <strong className="text-white/55">environmental monitoring</strong> and analysis</p>
      </motion.div>

      {/* Gauge */}
      <GlassCard delay={0.1} hover={false} className="mb-6 text-center py-6">
        <AQIGauge value={Math.round(aqiValue)} />
        <p className={`text-xs font-medium mt-3 ${st.text}`}>{st.desc}</p>
      </GlassCard>

      {/* Sensor Cards with sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: Thermometer, label: "Temperature", value: temperature, decimals: 1, suffix: "C", color: "#fb923c", sparkColor: "#fb923c" },
          { icon: Droplets, label: "Humidity", value: humidity, decimals: 0, suffix: "%", color: "#60a5fa", sparkColor: "#60a5fa" },
          { icon: Activity, label: "AQI Raw", value: Math.round(aqiValue), decimals: 0, suffix: "", color: "#00e676", sparkColor: "#00e676" },
        ].map((c, i) => (
          <GlassCard key={c.label} delay={0.15 + i * 0.05}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${c.color}10`, border: `1px solid ${c.color}20` }}>
                <c.icon className="h-4 w-4" style={{ color: c.color }} />
              </div>
              <MiniSparkline color={c.sparkColor} />
            </div>
            <p className="text-xs text-white/30 mb-1">{c.label}</p>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-heading font-bold text-white"><AnimatedCounter target={c.value} decimals={c.decimals} /></span>
              {c.suffix && <span className="text-sm text-white/25 mb-0.5">{c.suffix}</span>}
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart */}
        <GlassCard delay={0.3}>
          <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-4 w-4 text-white/30" /><h3 className="text-sm font-heading font-semibold text-white">AQI Trends (24h)</h3></div>
          <div className="grid grid-cols-12 gap-1 h-28 items-end mb-2">
            {Array.from({ length: 12 }, (_, i) => {
              const v = Math.random() * 80 + 15;
              const s = getAQIStatus(v);
              return (
                <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${Math.min(v, 100)}%` }} transition={{ duration: 0.4, delay: i * 0.04 }} className="w-full rounded-t-sm" style={{ background: `linear-gradient(to top, ${s.color}15, ${s.color}40)` }} />
              );
            })}
          </div>
          <div className="flex justify-between text-[9px] text-white/15"><span>Good</span><span>Moderate</span><span>Unhealthy</span></div>
        </GlassCard>

        {/* Recommendations */}
        <GlassCard delay={0.35}>
          <div className="flex items-center gap-2 mb-4"><Heart className="h-4 w-4 text-red-400" /><h3 className="text-sm font-heading font-semibold text-white">Health Recommendations</h3></div>
          <ul className="space-y-2.5">
            {tips.map((t, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }} className="flex items-start gap-2.5">
                <CheckCircle className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${st.text}`} />
                <span className="text-xs text-white/35">{t}</span>
              </motion.li>
            ))}
          </ul>
        </GlassCard>
      </div>

      {/* Alert */}
      <AnimatePresence>
        {aqiValue > 100 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className="mt-4">
            <GlassCard hover={false} className="border-red-500/10">
              <div className="flex items-start gap-3">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}><AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" /></motion.div>
                <div><p className="text-sm font-heading font-semibold text-red-400 mb-1">Air Quality Alert</p><p className="text-xs text-white/30">AQI at {Math.round(aqiValue)} - exceeds safe levels. Consider reducing outdoor exposure.</p></div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
