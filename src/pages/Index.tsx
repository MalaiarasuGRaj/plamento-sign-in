import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import AuthPage from "@/components/AuthPage";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
      }
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      setUser(null); // Clear user state anyway
    }
  };

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return <AuthPage onAuthSuccess={handleAuthSuccess} />;
};

export default Index;
