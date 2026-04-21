import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!currentUser.emailVerified && !currentUser.providerData.some(p => p.providerId === 'google.com')) {
    // If not verified and NOT a Google user, they should verify first
    // Note: Google users are usually automatically verified
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
