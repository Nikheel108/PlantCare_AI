import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, LogOut, Share2, Camera, Edit2, Check, Leaf, Sprout, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Navbar } from "@/components/layout/Navbar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, logout } = useAuth();

  // Display name can be edited locally; email is always from Google/Firebase
  const googleName = currentUser?.displayName ?? "Plant Enthusiast";
  const googleEmail = currentUser?.email ?? localStorage.getItem("userEmail") ?? "user@plantcareai.com";
  const googlePhoto = currentUser?.photoURL ?? "";

  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState(googleName);
  const [tempName, setTempName] = useState(googleName);
  const [profileImage, setProfileImage] = useState(googlePhoto);

  const isGoogleUser = !!currentUser?.providerData?.find(
    (p) => p.providerId === "google.com"
  );

  const memberSince = currentUser?.metadata?.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "January 2025";

  const lastLogin = currentUser?.metadata?.lastSignInTime
    ? new Date(currentUser.metadata.lastSignInTime).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Today";

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "See you soon! Keep your plants healthy! 🌱",
      });
      navigate("/login");
    } catch {
      toast({
        title: "Logout failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "PlantCareAI",
      text: "Check out PlantCareAI - Your intelligent plant care companion! 🌿",
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully!",
          description: "Thanks for spreading the word! 🌱",
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        toast({
          title: "Link copied!",
          description: "Share link has been copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleSaveProfile = () => {
    setUserName(tempName);
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your display name has been saved successfully",
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const stats = [
    { label: "Plants Monitored", value: "12", icon: "🌱" },
    { label: "Scans Completed", value: "48", icon: "🔍" },
    { label: "Days Active", value: "23", icon: "📅" },
    { label: "Health Score", value: "92%", icon: "💚" },
  ];

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            My Profile
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-2 shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                Profile Information
                {isGoogleUser && (
                  <span className="ml-auto flex items-center gap-1 text-xs font-normal text-muted-foreground bg-accent/30 px-2 py-1 rounded-full">
                    <svg className="h-3 w-3" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google Account
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-4 sm:mb-6">
                {/* Profile Photo */}
                <div className="relative group">
                  <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-primary/20">
                    <AvatarImage src={profileImage || googlePhoto} alt={userName} referrerPolicy="no-referrer" />
                    <AvatarFallback className="text-2xl sm:text-3xl bg-gradient-to-br from-green-400 to-green-600 text-white">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-upload"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-smooth shadow-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
                    aria-label="Upload profile photo"
                  >
                    <Camera className="h-4 w-4" />
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                {/* Google badge under avatar */}
                {isGoogleUser && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3 text-green-500" />
                    Verified via Google
                  </div>
                )}
              </div>

              {/* User Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    Display Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="w-full h-11 sm:h-12 text-base"
                    />
                  ) : (
                    <p className="text-base sm:text-lg font-semibold text-foreground">{userName}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4" />
                    Email
                    {isGoogleUser && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-normal">(from Google)</span>
                    )}
                  </label>
                  <p className="text-base sm:text-lg text-foreground">{googleEmail}</p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSaveProfile}
                        className="flex-1 gradient-primary text-white hover:opacity-90 min-h-[44px] sm:min-h-[48px]"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          setTempName(userName);
                        }}
                        variant="outline"
                        className="flex-1 min-h-[44px] sm:min-h-[48px]"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="w-full min-h-[44px] sm:min-h-[48px]"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Display Name
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4"
              >
                <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                  <Share2 className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Share PlantCareAI</p>
                  <p className="text-xs text-muted-foreground">Tell your friends</p>
                </div>
              </Button>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
              >
                <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-lg">
                  <LogOut className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Logout</p>
                  <p className="text-xs text-muted-foreground">Sign out of account</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {stats.map((stat, index) => (
            <Card
              key={stat.label}
              className="shadow-card border-border/50 hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <Card className="mt-6 shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Member Since</p>
                <p className="font-medium text-foreground">{memberSince}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Account Type</p>
                <p className="font-medium text-foreground flex items-center gap-1.5">
                  {isGoogleUser ? (
                    <>
                      <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Google User
                    </>
                  ) : (
                    "Email User"
                  )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Last Login</p>
                <p className="font-medium text-foreground">{lastLogin}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">User ID</p>
                <p className="font-medium text-foreground font-mono text-xs truncate">
                  {currentUser?.uid ?? "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Decorative Elements */}
      <div className="relative py-8 flex justify-center gap-2 opacity-30 pointer-events-none">
        <Sprout className="h-6 w-6 text-green-500 animate-pulse" style={{ animationDelay: '0s' }} />
        <Leaf className="h-6 w-6 text-green-600 animate-pulse" style={{ animationDelay: '0.2s' }} />
        <Sprout className="h-6 w-6 text-green-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
        <Leaf className="h-6 w-6 text-green-600 animate-pulse" style={{ animationDelay: '0.6s' }} />
        <Sprout className="h-6 w-6 text-green-500 animate-pulse" style={{ animationDelay: '0.8s' }} />
      </div>
    </div>
  );
}
