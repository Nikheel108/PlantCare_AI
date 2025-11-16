import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Leaf, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import plantLogo from "@/assets/plant-logo.png";
import heroPlants from "@/assets/hero-plants.jpg";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login
    setTimeout(() => {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-bg">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <img src={plantLogo} alt="PlantCareAI" className="h-10 w-10 sm:h-12 sm:w-12 mr-2 sm:mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              PlantCareAI
            </h1>
          </div>

          {/* Auth Card */}
          <Card className="shadow-card border-border/50 hover-lift">
            <CardHeader className="text-center pb-4 sm:pb-6">
              <CardTitle className="text-xl sm:text-2xl text-foreground">
                Welcome Back
              </CardTitle>
              <p className="text-sm sm:text-base text-muted-foreground">
                Sign in to your plant care dashboard
              </p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 h-11 sm:h-12">
                  <TabsTrigger value="login" className="text-sm sm:text-base">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="text-sm sm:text-base">Sign Up</TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="enter@email.com"
                        required
                        className="transition-smooth focus:shadow-soft h-11 sm:h-12 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          required
                          className="pr-10 transition-smooth focus:shadow-soft h-11 sm:h-12 text-base"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent min-w-[44px]"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full gradient-primary text-white hover:opacity-90 transition-smooth shadow-soft h-11 sm:h-12 text-base"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <Leaf className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </div>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Signup Form */}
                <TabsContent value="signup">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm sm:text-base">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        required
                        className="transition-smooth focus:shadow-soft h-11 sm:h-12 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm sm:text-base">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        className="transition-smooth focus:shadow-soft h-11 sm:h-12 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm sm:text-base">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          required
                          className="pr-10 transition-smooth focus:shadow-soft h-11 sm:h-12 text-base"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent min-w-[44px]"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full gradient-primary text-white hover:opacity-90 transition-smooth shadow-soft h-11 sm:h-12 text-base"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <Leaf className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </div>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6 px-4">
            By signing in, you agree to our{" "}
            <Link to="#" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Hero Image */}
      <div className="hidden lg:block relative">
        <img
          src={heroPlants}
          alt="Smart Plant Care"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
        <div className="absolute bottom-8 left-8 text-white max-w-md">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Smart Plant Care with AI
          </h2>
          <p className="text-lg lg:text-xl text-white/90">
            Monitor your plants' health, detect diseases early, and automate watering with our intelligent system.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-20 right-20 flex gap-4 opacity-40">
          <Sprout className="h-10 w-10 lg:h-12 lg:w-12 text-white animate-pulse" style={{ animationDelay: '0s' }} />
          <Leaf className="h-10 w-10 lg:h-12 lg:w-12 text-white animate-pulse" style={{ animationDelay: '0.3s' }} />
          <Sprout className="h-10 w-10 lg:h-12 lg:w-12 text-white animate-pulse" style={{ animationDelay: '0.6s' }} />
        </div>
      </div>
    </div>
  );
}