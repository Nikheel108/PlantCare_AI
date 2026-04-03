import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, ArrowRight, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import plantLogo from "@/assets/plant-logo.png";
import heroPlants from "@/assets/hero-plants.jpg";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [navigate]);



  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroPlants}
            alt="Smart Plant Care"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/50"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center animate-fade-in">
            {/* Logo */}
            <div className="w-full flex justify-center mb-6 sm:mb-8">
              <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
                <img src={plantLogo} alt="PlantCareAI" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  PlantCareAI
                </h1>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-6 px-4">
              Smart Plant Care with AI Technology
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Monitor your plants' health, detect diseases early, and automate watering
              with our intelligent plant care system. Experience the future of gardening.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button
                onClick={() => navigate("/login")}
                size="lg"
                className="gradient-primary text-white hover:opacity-90 shadow-soft px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg min-h-[48px] sm:min-h-[56px] w-full sm:w-auto flex items-center justify-center"
              >
                Start Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 dark:bg-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-4">
              Ready to Transform Your Plant Care?
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground px-4">
              Join thousands of gardeners using AI to grow healthier plants
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="relative w-full py-6 sm:py-8 flex flex-row items-center justify-center gap-2 opacity-30 pointer-events-none">
        <Sprout className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 animate-pulse" style={{ animationDelay: '0s' }} />
        <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 animate-pulse" style={{ animationDelay: '0.2s' }} />
        <Sprout className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
        <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 animate-pulse" style={{ animationDelay: '0.6s' }} />
        <Sprout className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 animate-pulse" style={{ animationDelay: '0.8s' }} />
      </div>
    </div>
  );
};

export default Index;
