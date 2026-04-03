import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Leaf, Home, Search, Sprout, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-card border-border/50 overflow-hidden">
          <CardContent className="p-8 sm:p-12">
            {/* Animated Plant Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-8 animate-bounce">
                  <Leaf className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>

            {/* 404 Message */}
            <div className="text-center mb-8">
              <h1 className="text-6xl sm:text-7xl font-bold text-foreground mb-4">
                4<span className="text-primary">0</span>4
              </h1>
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
                Oops! This Plant Doesn't Exist
              </h2>
              <p className="text-muted-foreground text-lg mb-2">
                Looks like this page has wilted away...
              </p>
              <p className="text-muted-foreground">
                The page <span className="font-mono text-sm bg-secondary px-2 py-1 rounded">{location.pathname}</span> couldn't be found in our garden.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Button
                onClick={() => navigate("/")}
                size="lg"
                className="gradient-primary text-white hover:opacity-90 gap-2"
              >
                <Home className="h-4 w-4" />
                Return Home
              </Button>
            </div>

            {/* Quick Links */}
            <div className="border-t border-border pt-6">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Or explore these popular pages:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {quickLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="flex items-center justify-center gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-smooth text-sm font-medium text-foreground hover:text-primary"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="mt-8 flex justify-center gap-2 opacity-30">
              <Sprout className="h-6 w-6 text-green-500 animate-pulse" style={{ animationDelay: '0s' }} />
              <Leaf className="h-6 w-6 text-green-600 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <Sprout className="h-6 w-6 text-green-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
              <Leaf className="h-6 w-6 text-green-600 animate-pulse" style={{ animationDelay: '0.6s' }} />
              <Sprout className="h-6 w-6 text-green-500 animate-pulse" style={{ animationDelay: '0.8s' }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
