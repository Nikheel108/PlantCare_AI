import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Leaf, Home, Search, Sprout, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ParticleBackground } from "@/components/ui/ParticleBackground";
import { GlassCard } from "@/components/ui/GlassCard";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const quickLinks = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Disease Detection", path: "/detection", icon: Search },
    { name: "Plant Assistant", path: "/chatbot", icon: Sprout },
  ];

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center px-4 relative">
      <ParticleBackground variant="default" />
      <div className="relative z-10 max-w-2xl w-full">
        <GlassCard hover={false} className="p-8 sm:p-12 text-center">
          {/* Animated Plant Icon */}
          <div className="flex justify-center mb-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="relative"
            >
              <div className="absolute inset-0 bg-neon-green/15 rounded-full blur-2xl" />
              <div className="relative bg-gradient-to-br from-neon-green to-green-600 rounded-full p-8">
                <Leaf className="h-16 w-16 text-surface-0" />
              </div>
            </motion.div>
          </div>

          {/* 404 */}
          <h1 className="text-6xl sm:text-7xl font-heading font-bold text-white mb-4">
            4<span className="text-neon">0</span>4
          </h1>
          <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-white mb-3">
            Oops! This Plant Doesn't Exist
          </h2>
          <p className="text-white/40 text-lg mb-2">Looks like this page has wilted away...</p>
          <p className="text-white/30 mb-8">
            The page <span className="font-mono text-sm bg-white/[0.04] px-2 py-1 rounded text-white/50">{location.pathname}</span> couldn't be found.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Button onClick={() => navigate(-1)} className="btn-glass gap-2 min-h-[44px]" size="lg">
              <ArrowLeft className="h-4 w-4" /> Go Back
            </Button>
            <Button onClick={() => navigate("/")} className="btn-neon gap-2 min-h-[44px]" size="lg">
              <Home className="h-4 w-4" /> Return Home
            </Button>
          </div>

          {/* Quick Links */}
          <div className="border-t border-white/[0.06] pt-6">
            <p className="text-sm text-white/25 mb-4">Or explore these popular pages:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quickLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-neon-green/20 transition-all duration-200 text-sm font-medium text-white/50 hover:text-neon-green"
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default NotFound;
