import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import plantLogo from "@/assets/plant-logo.png";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Disease Detection", href: "/detection" },
  { name: "Plant Types", href: "/plant-types" },
  { name: "Auto-Watering", href: "/watering" },
  { name: "Chatbot", href: "/chatbot" },
  { name: "History", href: "/history" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Simple logout simulation
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-90 transition-smooth">
              <img src={plantLogo} alt="PlantCareAI" className="h-8 w-8 sm:h-9 sm:w-9" />
              <span className="text-lg sm:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                PlantCareAI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-smooth hover-lift ${
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <ThemeToggle />
            
            {/* Profile Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 min-w-[44px] min-h-[44px]"
              aria-label="View profile"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white text-sm">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden min-w-[44px] min-h-[44px]"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-card/95 backdrop-blur-sm border-t border-border animate-slide-up">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-smooth min-h-[44px] flex items-center ${
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-border pt-2 mt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full justify-start px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/20 min-h-[44px]"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}