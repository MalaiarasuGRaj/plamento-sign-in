import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import AuthPage from "@/components/AuthPage";
import Dashboard from "@/components/Dashboard";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Called when login/signup is successful
  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
  };

  // Updated logout function
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to logout",
          variant: "destructive"
        });
        console.error("Logout error:", error);
      } else {
        toast({
          title: "Success",
          description: "Logged out successfully"
        });

        // Clear user state and force redirect to AuthPage
        setUser(null);
        window.location.href = "/"; // ✅ Full reload ensures session clears
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout",
        variant: "destructive"
      });
      console.error("Logout failed:", error);

      // Still attempt to reset and redirect
      setUser(null);
      window.location.href = "/";
    }
  };

  // ✅ If user is authenticated, show Dashboard
  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  // ✅ Otherwise, show AuthPage (login/signup)
  return <AuthPage onAuthSuccess={handleAuthSuccess} />;
};

export default Index;
