import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [isSignup, setIsSignup] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          onAuthSuccess(session.user);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        onAuthSuccess(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [onAuthSuccess]);

  const handleLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  if (isSignup) {
    return <SignupPage onBackToLogin={() => setIsSignup(false)} />;
  }

  return <LoginPage onLogin={handleLogin} onSignup={() => setIsSignup(true)} />;
};

export default AuthPage;