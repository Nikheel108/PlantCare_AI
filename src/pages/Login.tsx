import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Chrome, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { ParticleBackground } from "@/components/ui/ParticleBackground";
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
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

  useEffect(() => {
    if (currentUser && currentUser.emailVerified) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.currentTarget as HTMLFormElement;
    const email = (form.querySelector("#email") as HTMLInputElement).value;
    const password = (form.querySelector("#password") as HTMLInputElement).value;

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
    const name = (form.querySelector("#signup-name") as HTMLInputElement).value;
    const email = (form.querySelector("#signup-email") as HTMLInputElement).value;
    const password = (form.querySelector("#signup-password") as HTMLInputElement).value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
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

  // Verification Pending
  if (isVerificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface-0 relative">
        <ParticleBackground variant="default" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="glass rounded-2xl p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-neon-green/10 rounded-full flex items-center justify-center mb-4 border border-neon-green/20">
              <Mail className="h-8 w-8 text-neon-green" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-white mb-2">Verify your email</h2>
            <p className="text-white/50 text-sm mb-6">
              We've sent a verification link to:
              <br />
              <span className="font-semibold text-white">{emailForVerification}</span>
            </p>
            <div className="bg-white/[0.03] p-4 rounded-xl text-sm text-white/40 mb-6 border border-white/[0.06]">
              Please check your inbox (and spam folder) and click the link to activate your account.
            </div>
            <div className="space-y-3">
              <Button onClick={() => window.location.reload()} className="w-full btn-neon min-h-[44px]">
                I've Verified My Email
              </Button>
              <Button onClick={handleResendVerification} className="w-full btn-glass min-h-[44px]">
                Resend Verification Email
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsVerificationSent(false)}
                className="w-full text-white/30 hover:text-white/60 min-h-[44px]"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface-0">
      {/* Left — Form */}
      <div className="relative flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <ParticleBackground variant="default" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-neon-green/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <img src={plantLogo} alt="PlantCare AI" className="h-10 w-10 sm:h-12 sm:w-12 mr-3" />
            <h1 className="text-2xl sm:text-3xl font-heading font-bold bg-gradient-text">
              PlantCare AI
            </h1>
          </div>

          {/* Auth Card */}
          <div className="glass rounded-2xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">Welcome Back</h2>
              <p className="text-sm text-white/40 mt-1">Manage your plants with AI</p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 h-11 bg-white/[0.04] border border-white/[0.06]">
                <TabsTrigger value="login" className="text-sm data-[state=active]:bg-neon-green/15 data-[state=active]:text-neon-green">
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-sm data-[state=active]:bg-neon-green/15 data-[state=active]:text-neon-green">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/60 text-sm">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" required className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="password" className="text-white/60 text-sm">Password</Label>
                      <Link to="#" className="text-xs text-neon-green hover:underline">Forgot password?</Link>
                    </div>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required className="pr-10 h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25" />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 text-white/30 hover:text-white/60 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full btn-neon h-11" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Form */}
              <TabsContent value="signup">
                <form onSubmit={handleEmailSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-white/60 text-sm">Full Name</Label>
                    <Input id="signup-name" type="text" placeholder="John Doe" required className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white/60 text-sm">Email</Label>
                    <Input id="signup-email" type="email" placeholder="john@example.com" required className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white/60 text-sm">Password</Label>
                    <div className="relative">
                      <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="••••••••" required className="pr-10 h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25" />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 text-white/30 hover:text-white/60 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full btn-neon h-11" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/[0.06]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface-1 px-3 text-white/25">Or continue with</span>
              </div>
            </div>

            {/* Google */}
            <Button
              variant="outline"
              type="button"
              className="w-full h-11 btn-glass"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Chrome className="mr-2 h-4 w-4 text-red-400" />
              Continue with Google
            </Button>
          </div>

          <p className="text-center text-xs text-white/20 mt-6">
            By signing up, you agree to our{" "}
            <Link to="#" className="text-neon-green hover:underline">Terms</Link> and{" "}
            <Link to="#" className="text-neon-green hover:underline">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>

      {/* Right — Hero Image */}
      <div className="hidden lg:block relative">
        <img src={heroPlants} alt="Smart Plant Care" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-0/90 via-surface-0/40 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-white max-w-md">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold mb-4">
            Intelligent <span className="text-neon">Plant Care</span>
          </h2>
          <p className="text-lg text-white/70">
            Keep your green friends healthy with AI-powered disease detection and automated care.
          </p>
        </div>
      </div>
    </div>
  );
}