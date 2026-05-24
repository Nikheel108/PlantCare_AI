import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Droplets, Wind, Activity, TrendingUp, TrendingDown, ArrowRight, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { MiniSparkline } from "@/components/ui/MiniSparkline";
import { useEsp } from "@/contexts/EspContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [soilMoisture, setSoilMoisture] = useState(65);
  const [temperature, setTemperature] = useState(22);
  const [humidity, setHumidity] = useState(58);

  const { data, online } = useEsp();

  // Removed random readings simulation

  useEffect(() => {
    if (typeof data?.soilPercent === "number") {
      setSoilMoisture(Math.max(0, Math.min(100, Math.round(data.soilPercent))));
      return;
    }
    if (typeof data?.soilDry === "number") setSoilMoisture(data.soilDry === 1 ? 18 : 76);
  }, [data?.soilPercent, data?.soilDry]);

  const displayTemp = typeof data?.temperature === "number" ? data.temperature : temperature;
  const displayAQI = typeof data?.aqi === "number" ? data.aqi : null;

  const firstName = currentUser?.displayName?.split(" ")[0] || "User";

  const recentActivities = [
    { action: "Disease scan completed", plant: "Tomato Plant #1", time: "2 min ago", status: "Healthy" },
    { action: "Auto-watering activated", plant: "Herb Garden", time: "1 hr ago", status: "Success" },
    { action: "Moisture alert triggered", plant: "Succulent Collection", time: "3 hrs ago", status: "Warning" },
    { action: "Disease detected", plant: "Rose Bush", time: "1 day ago", status: "Action Required" },
  ];

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8"
      >
        <div>
          <p className="text-sm text-white/30 mb-1">Welcome back,</p>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
            Hey, <span className="text-neon">{firstName}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white/30">
            <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-neon-green" : "bg-red-500"}`} />
            {online ? "System Online" : "System Offline"}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white/25 hover:text-white/60 hover:bg-white/[0.04] rounded-xl"
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Stat Cards — large KPI numbers with sparklines */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {/* Soil Moisture */}
        <motion.div variants={fadeUp}>
          <GlassCard delay={0} className="relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/[0.08] border border-cyan-500/20 flex items-center justify-center">
                <Droplets className="h-4 w-4 text-cyan-400" />
              </div>
              <MiniSparkline color="#22d3ee" />
            </div>
            <p className="text-xs text-white/30 mb-1">Soil Moisture</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-heading font-bold text-white">{soilMoisture.toFixed(0)}%</span>
              <Badge className="bg-neon-green/10 text-neon-green border-neon-green/20 text-[10px] mb-1">
                <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> 4.2%
              </Badge>
            </div>
            <Progress value={soilMoisture} className="h-1 mt-3 progress-neon" />
          </GlassCard>
        </motion.div>

        {/* Temperature */}
        <motion.div variants={fadeUp}>
          <GlassCard delay={0} className="relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/[0.08] border border-orange-500/20 flex items-center justify-center">
                <Activity className="h-4 w-4 text-orange-400" />
              </div>
              <MiniSparkline color="#fb923c" />
            </div>
            <p className="text-xs text-white/30 mb-1">Temperature</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-heading font-bold text-white">
                <AnimatedCounter target={displayTemp} decimals={1} suffix="" />
              </span>
              <span className="text-lg text-white/40 mb-0.5">C</span>
            </div>
            <p className="text-[11px] text-white/20 mt-2">Optimal for growth</p>
          </GlassCard>
        </motion.div>

        {/* Humidity */}
        <motion.div variants={fadeUp}>
          <GlassCard delay={0} className="relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/[0.08] border border-blue-500/20 flex items-center justify-center">
                <Droplets className="h-4 w-4 text-blue-400" />
              </div>
              <MiniSparkline color="#60a5fa" />
            </div>
            <p className="text-xs text-white/30 mb-1">Humidity</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-heading font-bold text-white">{humidity.toFixed(0)}%</span>
              <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[10px] mb-1">
                <TrendingDown className="h-2.5 w-2.5 mr-0.5" /> 1.8%
              </Badge>
            </div>
            <p className="text-[11px] text-white/20 mt-2">Ideal for most plants</p>
          </GlassCard>
        </motion.div>

        {/* Air Quality */}
        <motion.div variants={fadeUp}>
          <GlassCard delay={0} className="relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-neon-green/[0.08] border border-neon-green/20 flex items-center justify-center">
                <Wind className="h-4 w-4 text-neon-green" />
              </div>
              <MiniSparkline color="#00e676" />
            </div>
            <p className="text-xs text-white/30 mb-1">Air Quality</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-heading font-bold text-white">
                {displayAQI !== null ? displayAQI : "42"}
              </span>
              <span className="text-xs text-white/25 mb-1">AQI</span>
            </div>
            <p className="text-[11px] text-white/20 mt-2">
              {displayAQI !== null ? "Live sensor" : "Simulated"}
            </p>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Two-column: Quick Actions + LED Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <GlassCard delay={0.3} hover={false}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-heading font-semibold text-white">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { title: "Auto Watering", desc: "Smart irrigation control", icon: Droplets, color: "#00bcd4", href: "/watering" },
                { title: "Disease Scan", desc: "AI plant analysis", icon: Camera, color: "#00e676", href: "/detection" },
                { title: "Air Quality", desc: "Environmental data", icon: Wind, color: "#90a4ae", href: "/aqi" },
              ].map((action) => (
                <button
                  key={action.title}
                  onClick={() => navigate(action.href)}
                  className="group flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.04] transition-all duration-200 text-left"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: `${action.color}10`, border: `1px solid ${action.color}25` }}
                  >
                    <action.icon className="h-4.5 w-4.5" style={{ color: action.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{action.title}</p>
                    <p className="text-[11px] text-white/25">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-white/10 group-hover:text-white/30 ml-auto flex-shrink-0 transition-all duration-200 group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Sensor & LED Status */}
        <GlassCard delay={0.35} hover={false}>
          <h2 className="text-sm font-heading font-semibold text-white mb-4">Sensor Status</h2>
          <div className="space-y-3">
            {[
              { label: "System", active: online, color: "bg-neon-green" },
              { label: "Water Pump", active: data.pumpActive === 1, color: "bg-yellow-400" },
              { label: "Mist System", active: data.mistActive === 1, color: "bg-blue-500" },
              { label: "AQI Alert", active: typeof data.aqi === "number" && data.aqi > 400, color: "bg-red-500" },
            ].map((sensor) => (
              <div key={sensor.label} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                      sensor.active ? `${sensor.color} shadow-[0_0_6px_currentColor]` : "bg-white/10"
                    }`}
                  />
                  <span className="text-xs text-white/40">{sensor.label}</span>
                </div>
                <span className={`text-[10px] font-medium ${sensor.active ? "text-white/60" : "text-white/15"}`}>
                  {sensor.active ? "Active" : "Idle"}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Activity Table */}
      <GlassCard delay={0.4} hover={false}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-heading font-semibold text-white">Recent Activity</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/history")}
            className="text-xs text-white/25 hover:text-neon-green h-7 px-2"
          >
            View All
          </Button>
        </div>

        {/* Table header */}
        <div className="hidden sm:grid grid-cols-4 gap-4 px-3 py-2 text-[10px] font-semibold text-white/20 uppercase tracking-wider border-b border-white/[0.04]">
          <span>Action</span>
          <span>Plant</span>
          <span>Time</span>
          <span className="text-right">Status</span>
        </div>

        {/* Table rows */}
        <div className="divide-y divide-white/[0.03]">
          {recentActivities.map((activity, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.06 }}
              className="grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 px-3 py-3 hover:bg-white/[0.02] transition-colors rounded-lg"
            >
              <span className="text-sm text-white/60 font-medium">{activity.action}</span>
              <span className="text-xs text-white/30">{activity.plant}</span>
              <span className="text-xs text-white/20">{activity.time}</span>
              <div className="sm:text-right">
                <Badge
                  className={`text-[10px] border ${
                    activity.status === "Healthy" || activity.status === "Success"
                      ? "bg-neon-green/10 text-neon-green border-neon-green/20"
                      : activity.status === "Warning"
                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}
                >
                  {activity.status}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </DashboardLayout>
  );
}