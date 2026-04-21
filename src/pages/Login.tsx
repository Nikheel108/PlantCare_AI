import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Leaf, Sprout, Mail, Chrome, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  updateProfile 
} from "@/lib/firebase";
import { toast } from "sonner";
import plantLogo from "@/assets/plant-logo.png";
import heroPlants from "@/assets/hero-plants.jpg";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState("");
  const navigate = useNavigate();
  const { currentUser, signInWithGoogle } = useAuth();

  // Redirect if already logged in and verified
  useEffect(() => {
    if (currentUser && currentUser.emailVerified) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.currentTarget as HTMLFormElement;
    const email = (form.querySelector('#email') as HTMLInputElement).value;
    const password = (form.querySelector('#password') as HTMLInputElement).value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        setIsVerificationSent(true);
        setEmailForVerification(email);
        toast.error("Please verify your email before logging in.");
        setIsLoading(false);
        return;
      }

      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.currentTarget as HTMLFormElement;
    const name = (form.querySelector('#signup-name') as HTMLInputElement).value;
    const email = (form.querySelector('#signup-email') as HTMLInputElement).value;
    const password = (form.querySelector('#signup-password') as HTMLInputElement).value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set display name
      await updateProfile(userCredential.user, { displayName: name });
      
      // Send verification email
      await sendEmailVerification(userCredential.user);
      
      setIsVerificationSent(true);
      setEmailForVerification(email);
      toast.success("Account created! Verification email sent.");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        toast.success("Verification email resent!");
      } catch (error: any) {
        toast.error(error.message || "Failed to resend email");
      }
    }
  };

  // Verification Pending View
  if (isVerificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-bg">
        <Card className="w-full max-w-md shadow-card border-border/50 animate-scale-in">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
            <p className="text-muted-foreground mt-2">
              We've sent a 2-step verification link to:
              <br />
              <span className="font-semibold text-foreground">{emailForVerification}</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/50 p-4 rounded-lg text-sm text-center">
              <p>Please check your inbox (and spam folder) and click the link to activate your account.</p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full gradient-primary text-white"
              >
                I've Verified My Email
              </Button>
              <Button 
                variant="outline" 
                onClick={handleResendVerification}
                className="w-full"
              >
                Resend Verification Email
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setIsVerificationSent(false)}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                Manage your plants with AI
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
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link to="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          className="pr-10 h-11"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full gradient-primary text-white h-11"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                {/* Signup Form */}
                <TabsContent value="signup">
                  <form onSubmit={handleEmailSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          className="pr-10 h-11"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full gradient-primary text-white h-11"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* OR Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Google Button - Positioned Below */}
              <Button
                variant="outline"
                type="button"
                className="w-full h-11 border-border/50 hover:bg-secondary/50"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <Chrome className="mr-2 h-4 w-4 text-red-500" />
                Continue with Google
              </Button>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6 px-4">
            By signing up, you agree to our{" "}
            <Link to="#" className="text-primary hover:underline">Terms</Link> and{" "}
            <Link to="#" className="text-primary hover:underline">Privacy Policy</Link>
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
            Intelligent Plant Care
          </h2>
          <p className="text-lg lg:text-xl text-white/90">
            Keep your green friends healthy with AI-powered disease detection and automated care.
          </p>
        </div>
      </div>
    </div>
  );
}