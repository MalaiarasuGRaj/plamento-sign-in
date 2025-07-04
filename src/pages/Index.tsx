import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import AuthPage from "@/components/AuthPage";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return <AuthPage onAuthSuccess={handleAuthSuccess} />;
};

export default Index;
