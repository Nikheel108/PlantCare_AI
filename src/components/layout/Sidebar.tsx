import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Droplets, Wind, Camera, Sprout, MessageSquare, History,
  User, LogOut, ChevronLeft, ChevronRight, Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import plantLogo from "@/assets/plant-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useEsp } from "@/contexts/EspContext";

const navSections = [
  {
    label: "MAIN",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "MONITORING",
    items: [
      { name: "Auto Watering", href: "/watering", icon: Droplets },
      { name: "Air Quality", href: "/aqi", icon: Wind },
    ],
  },
  {
    label: "ANALYSIS",
    items: [
      { name: "Disease Detection", href: "/detection", icon: Camera },
      { name: "Plant Types", href: "/plant-types", icon: Sprout },
    ],
  },
  {
    label: "TOOLS",
    items: [
      { name: "Plant Assistant", href: "/chatbot", icon: MessageSquare },
      { name: "History", href: "/history", icon: History },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { online } = useEsp();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/[0.04]">
        <img src={plantLogo} alt="PlantCare AI" className="h-8 w-8 flex-shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-base font-heading font-bold bg-gradient-text whitespace-nowrap overflow-hidden"
            >
              PlantCare AI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-semibold tracking-[0.15em] text-white/20 uppercase px-3 mb-2"
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-neon-green/[0.08] text-neon-green"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                  }`}
                >
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-neon-green"
                      style={{ boxShadow: "0 0 8px rgba(0,230,118,0.5)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className={`h-[18px] w-[18px] flex-shrink-0 transition-colors duration-200 ${
                    isActive(item.href) ? "text-neon-green" : "text-white/30 group-hover:text-white/60"
                  }`} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ESP Status */}
      <div className="px-3 py-2 mx-2 mb-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              online
                ? "bg-neon-green shadow-[0_0_6px_rgba(0,230,118,0.6)]"
                : "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
            }`}
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-white/25"
              >
                ESP {online ? "Connected" : "Offline"}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* User profile */}
      <div className="border-t border-white/[0.04] px-3 py-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/profile")}
            className="flex-shrink-0"
          >
            <Avatar className="h-8 w-8">
              {currentUser?.photoURL && (
                <AvatarImage src={currentUser.photoURL} alt={currentUser.displayName || ""} />
              )}
              <AvatarFallback className="bg-gradient-to-br from-neon-green to-green-600 text-surface-0 text-xs font-bold">
                {currentUser?.displayName
                  ? currentUser.displayName.charAt(0).toUpperCase()
                  : <User className="h-3.5 w-3.5" />}
              </AvatarFallback>
            </Avatar>
          </button>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-xs font-medium text-white/70 truncate">
                  {currentUser?.displayName || "User"}
                </p>
                <p className="text-[10px] text-white/25 truncate">
                  {currentUser?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-7 w-7 text-white/20 hover:text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle — desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center py-2.5 border-t border-white/[0.04] text-white/15 hover:text-white/40 transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-surface-1/90 backdrop-blur-xl border border-white/[0.06] text-white/50 hover:text-white/80"
        aria-label="Open menu"
      >
        <LayoutDashboard className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-surface-1/70 backdrop-blur-2xl border-r border-white/[0.04] flex-shrink-0 transition-all duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ width: collapsed ? 68 : 240 }}
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
