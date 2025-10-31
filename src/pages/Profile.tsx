import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, LogOut, Share2, Camera, Edit2, Check, Leaf, Sprout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Navbar } from "@/components/layout/Navbar";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState("Plant Enthusiast");
  const [userEmail, setUserEmail] = useState("user@plantcareai.com");
  const [tempName, setTempName] = useState(userName);
  const [profileImage, setProfileImage] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    toast({
      title: "Logged out successfully",
      description: "See you soon! Keep your plants healthy! 🌱",
    });
    setTimeout(() => {
      navigate("/login");
    }, 1000);
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
        // Fallback: Copy to clipboard
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
      description: "Your profile has been saved successfully",
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-2 shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-6">
                {/* Profile Photo */}
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-primary/20">
                    <AvatarImage src={profileImage} alt={userName} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-green-400 to-green-600 text-white">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-upload"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-smooth shadow-lg"
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
              </div>

              {/* User Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    Username
                  </label>
                  {isEditing ? (
                    <Input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-foreground">{userName}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <p className="text-lg text-foreground">{userEmail}</p>
                </div>

                <div className="pt-4 flex gap-3">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSaveProfile}
                        className="flex-1 gradient-primary text-white hover:opacity-90"
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
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Profile
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
                <p className="font-medium text-foreground">January 2025</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Account Type</p>
                <p className="font-medium text-foreground">Premium User</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Last Login</p>
                <p className="font-medium text-foreground">Today at 4:48 PM</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Location</p>
                <p className="font-medium text-foreground">India</p>
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
