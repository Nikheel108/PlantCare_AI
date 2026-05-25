import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useEsp } from "@/contexts/EspContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import plantLogo from "@/assets/plant-logo.png";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Disease Detection", href: "/detection" },
  { name: "Plant Types", href: "/plant-types" },
  { name: "Auto-Watering", href: "/watering" },
  { name: "Air Quality", href: "/aqi" },
  { name: "Chatbot", href: "/chatbot" },
  { name: "History", href: "/history" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { online } = useEsp();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Theme Toggle */}
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 group"
            >
              <img
                src={plantLogo}
                alt="PlantCareAI"
                className="h-8 w-8 sm:h-9 sm:w-9 transition-transform duration-300 group-hover:scale-110"
              />
              <span className="text-lg sm:text-xl font-heading font-bold bg-gradient-text">
                PlantCare AI
              </span>
            </Link>
            <ThemeToggle />
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? "text-neon"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {item.name}
                {isActive(item.href) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #00e676, #4caf50)",
                      boxShadow: "0 0 8px rgba(0, 230, 118, 0.5)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* ESP Status */}
            <div className="flex items-center gap-1.5 mr-1">
              <span
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  online
                    ? "bg-neon-green shadow-[0_0_6px_rgba(0,230,118,0.6)]"
                    : "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
                }`}
              />
              <span className="text-xs text-white/30 hidden sm:inline">
                {online ? "Online" : "Offline"}
              </span>
            </div>

            {/* Profile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
              className="text-muted-foreground hover:text-foreground hover:bg-accent min-w-[44px] min-h-[44px] rounded-xl"
              aria-label="View profile"
            >
              <Avatar className="h-8 w-8">
                {currentUser?.photoURL ? (
                  <AvatarImage
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || ""}
                  />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-neon-green to-green-600 text-surface-0 text-sm font-bold">
                  {currentUser?.displayName
                    ? currentUser.displayName.charAt(0).toUpperCase()
                    : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-accent min-w-[44px] min-h-[44px]"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden border-t border-white/[0.06]"
            >
              <div className="py-3 space-y-1">
                {navigation.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 min-h-[44px] flex items-center ${
                        isActive(item.href)
                          ? "text-neon bg-accent"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                <div className="border-t border-white/[0.06] pt-2 mt-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full justify-start px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent min-h-[44px] rounded-xl"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}