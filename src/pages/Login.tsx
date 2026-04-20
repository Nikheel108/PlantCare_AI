import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Leaf, Sprout, Mail, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  signInWithGoogle,
  signInWithEmail,
  createAccountWithEmail,
  resendVerificationEmail,
} from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import plantLogo from "@/assets/plant-logo.png";
import heroPlants from "@/assets/hero-plants.jpg";

// Reusable Google logo SVG
function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="flex-shrink-0">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ─── Google button shared component ────────────────────────────────────────
function GoogleSignInButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-11 sm:h-12 text-base font-medium flex items-center justify-center gap-3 border-border/80 hover:bg-accent/20 transition-smooth"
      onClick={onClick}
      disabled={loading}
      id="google-signin-btn"
    >
      {loading ? <Leaf className="h-4 w-4 animate-spin" /> : <GoogleLogo />}
      {loading ? "Connecting…" : "Continue with Google"}
    </Button>
  );
}

// ─── OR divider ─────────────────────────────────────────────────────────────
function OrDivider() {
  return (
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border/60" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">or</span>
      </div>
    </div>
  );
}

// ─── Verification pending screen ────────────────────────────────────────────
function VerificationPending({
  email,
  onResend,
  resending,
}: {
  email: string;
  onResend: () => void;
  resending: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-4">
      <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-4">
        <Mail className="h-10 w-10 text-green-600 dark:text-green-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Verify your email</h3>
        <p className="text-sm text-muted-foreground">
          A verification link was sent to
        </p>
        <p className="text-sm font-medium text-primary mt-0.5 break-all">{email}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Please check your inbox (and spam folder) and click the link to activate your account.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <Button
          variant="outline"
          onClick={onResend}
          disabled={resending}
          className="w-full h-11 gap-2"
        >
          {resending ? (
            <Leaf className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {resending ? "Sending…" : "Resend verification email"}
        </Button>
        <p className="text-xs text-muted-foreground">
          After verifying, refresh this page or{" "}
          <button
            type="button"
            className="text-primary underline"
            onClick={() => window.location.reload()}
          >
            click here
          </button>{" "}
          to sign in.
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── Google sign-in (works for both login & signup — Firebase handles it) ──
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast({ title: "Welcome! 🌱", description: "Signed in with Google successfully." });
      navigate("/dashboard");
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code !== "auth/popup-closed-by-user") {
        toast({
          title: "Google sign-in failed",
          description: err.message ?? "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ── Login with email/password ─────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoginLoading(true);
    const form = e.currentTarget;
    const email = (form.querySelector("#login-email") as HTMLInputElement).value.trim();
    const password = (form.querySelector("#login-password") as HTMLInputElement).value;

    try {
      const result = await signInWithEmail(email, password);
      if (!result.user.emailVerified) {
        // Account exists but not yet verified — show pending screen
        setVerificationEmail(email);
        toast({
          title: "Email not verified",
          description: "Please verify your email before signing in.",
          variant: "destructive",
        });
        setIsLoginLoading(false);
        return;
      }
      toast({ title: "Welcome back! 🌱", description: "Signed in successfully." });
      navigate("/dashboard");
    } catch (error: unknown) {
      const err = error as { code?: string };
      let msg = "Something went wrong. Please try again.";
      if (err.code === "auth/user-not-found") msg = "No account found with this email. Please sign up.";
      else if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") msg = "Incorrect password. Please try again.";
      else if (err.code === "auth/invalid-email") msg = "Invalid email address.";
      else if (err.code === "auth/too-many-requests") msg = "Too many attempts. Please try again later.";
      toast({ title: "Login failed", description: msg, variant: "destructive" });
      setIsLoginLoading(false);
    }
  };

  // ── Sign up with email/password + email verification ──────────────────────
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSignupLoading(true);
    const form = e.currentTarget;
    const name = (form.querySelector("#signup-name") as HTMLInputElement).value.trim();
    const email = (form.querySelector("#signup-email") as HTMLInputElement).value.trim();
    const password = (form.querySelector("#signup-password") as HTMLInputElement).value;

    if (password.length < 6) {
      toast({ title: "Weak password", description: "Password must be at least 6 characters.", variant: "destructive" });
      setIsSignupLoading(false);
      return;
    }

    try {
      await createAccountWithEmail(email, password, name);
      // Show email verification pending screen
      setVerificationEmail(email);
      toast({
        title: "Account created! ✅",
        description: "A verification email has been sent. Please check your inbox.",
      });
    } catch (error: unknown) {
      const err = error as { code?: string };
      let msg = "Something went wrong. Please try again.";
      if (err.code === "auth/email-already-in-use") msg = "This email is already registered. Please log in instead.";
      else if (err.code === "auth/invalid-email") msg = "Invalid email address.";
      else if (err.code === "auth/weak-password") msg = "Password must be at least 6 characters.";
      toast({ title: "Sign-up failed", description: msg, variant: "destructive" });
    } finally {
      setIsSignupLoading(false);
    }
  };

  // ── Resend verification email ─────────────────────────────────────────────
  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
      toast({ title: "Email sent!", description: "Verification email resent. Check your inbox." });
    } catch {
      toast({ title: "Failed to resend", description: "Please try again in a moment.", variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left: Form ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-bg">
        <div className="w-full max-w-md animate-fade-in">

          {/* Logo */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <img src={plantLogo} alt="PlantCareAI" className="h-10 w-10 sm:h-12 sm:w-12 mr-2 sm:mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              PlantCareAI
            </h1>
          </div>

          {/* Card */}
          <Card className="shadow-card border-border/50 hover-lift">
            <CardHeader className="text-center pb-2 sm:pb-4">
              <CardTitle className="text-xl sm:text-2xl text-foreground">
                {verificationEmail ? "Check your inbox" : "Welcome"}
              </CardTitle>
              {!verificationEmail && (
                <p className="text-sm sm:text-base text-muted-foreground">
                  Sign in or create your plant care account
                </p>
              )}
            </CardHeader>

            <CardContent>
              {/* ── Verification pending state ── */}
              {verificationEmail ? (
                <VerificationPending
                  email={verificationEmail}
                  onResend={handleResend}
                  resending={resending}
                />
              ) : (
                /* ── Normal auth UI ── */
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-5 h-11 sm:h-12">
                    <TabsTrigger value="login" className="text-sm sm:text-base">Login</TabsTrigger>
                    <TabsTrigger value="signup" className="text-sm sm:text-base">Sign Up</TabsTrigger>
                  </TabsList>

                  {/* ════ LOGIN TAB ════ */}
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-sm sm:text-base">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          className="h-11 sm:h-12 text-base transition-smooth focus:shadow-soft"
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-sm sm:text-base">Password</Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showLoginPass ? "text" : "password"}
                            placeholder="Enter your password"
                            required
                            className="pr-10 h-11 sm:h-12 text-base transition-smooth focus:shadow-soft"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent min-w-[44px]"
                            onClick={() => setShowLoginPass(!showLoginPass)}
                            aria-label={showLoginPass ? "Hide password" : "Show password"}
                          >
                            {showLoginPass
                              ? <EyeOff className="h-4 w-4 text-muted-foreground" />
                              : <Eye className="h-4 w-4 text-muted-foreground" />}
                          </Button>
                        </div>
                      </div>

                      {/* Sign In button */}
                      <Button
                        type="submit"
                        className="w-full gradient-primary text-white hover:opacity-90 transition-smooth shadow-soft h-11 sm:h-12 text-base"
                        disabled={isLoginLoading}
                      >
                        {isLoginLoading
                          ? <><Leaf className="mr-2 h-4 w-4 animate-spin" />Signing in…</>
                          : "Sign In"}
                      </Button>

                      {/* ── OR divider ── */}
                      <OrDivider />

                      {/* Google button — BELOW Sign In */}
                      <GoogleSignInButton onClick={handleGoogleSignIn} loading={isGoogleLoading} />
                    </form>
                  </TabsContent>

                  {/* ════ SIGN UP TAB ════ */}
                  <TabsContent value="signup">
                    <form onSubmit={handleSignup} className="space-y-4">
                      {/* Full Name */}
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-sm sm:text-base">Full Name</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          required
                          className="h-11 sm:h-12 text-base transition-smooth focus:shadow-soft"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm sm:text-base">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="john@example.com"
                          required
                          className="h-11 sm:h-12 text-base transition-smooth focus:shadow-soft"
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm sm:text-base">
                          Password
                          <span className="text-xs font-normal text-muted-foreground ml-1">(min. 6 chars)</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showSignupPass ? "text" : "password"}
                            placeholder="Create a strong password"
                            required
                            minLength={6}
                            className="pr-10 h-11 sm:h-12 text-base transition-smooth focus:shadow-soft"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent min-w-[44px]"
                            onClick={() => setShowSignupPass(!showSignupPass)}
                            aria-label={showSignupPass ? "Hide password" : "Show password"}
                          >
                            {showSignupPass
                              ? <EyeOff className="h-4 w-4 text-muted-foreground" />
                              : <Eye className="h-4 w-4 text-muted-foreground" />}
                          </Button>
                        </div>
                      </div>

                      {/* Two-step verification notice */}
                      <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-lg p-3 text-xs text-green-700 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>
                          After signing up, a <strong>verification email</strong> will be sent to your inbox.
                          You must verify it before you can log in.
                        </span>
                      </div>

                      {/* Create Account button */}
                      <Button
                        type="submit"
                        className="w-full gradient-primary text-white hover:opacity-90 transition-smooth shadow-soft h-11 sm:h-12 text-base"
                        disabled={isSignupLoading}
                      >
                        {isSignupLoading
                          ? <><Leaf className="mr-2 h-4 w-4 animate-spin" />Creating account…</>
                          : "Create Account"}
                      </Button>

                      {/* ── OR divider ── */}
                      <OrDivider />

                      {/* Google button — BELOW Create Account */}
                      <GoogleSignInButton onClick={handleGoogleSignIn} loading={isGoogleLoading} />
                    </form>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6 px-4">
            By signing in, you agree to our{" "}
            <Link to="#" className="text-primary hover:underline">Terms of Service</Link>{" "}
            and{" "}
            <Link to="#" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>

      {/* ── Right: Hero Image ───────────────────────────────────────────────── */}
      <div className="hidden lg:block relative">
        <img
          src={heroPlants}
          alt="Smart Plant Care"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
        <div className="absolute bottom-8 left-8 text-white max-w-md">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Smart Plant Care with AI</h2>
          <p className="text-lg lg:text-xl text-white/90">
            Monitor your plants' health, detect diseases early, and automate watering with our intelligent system.
          </p>
        </div>
        <div className="absolute bottom-20 right-20 flex items-center gap-4 opacity-40">
          <Sprout className="h-10 w-10 lg:h-12 lg:w-12 text-white animate-pulse" style={{ animationDelay: "0s" }} />
          <Leaf className="h-10 w-10 lg:h-12 lg:w-12 text-white animate-pulse" style={{ animationDelay: "0.3s" }} />
          <Sprout className="h-10 w-10 lg:h-12 lg:w-12 text-white animate-pulse" style={{ animationDelay: "0.6s" }} />
        </div>
      </div>
    </div>
  );
}