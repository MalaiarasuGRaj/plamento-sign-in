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
        console.log('AuthPage - Auth state change:', { event, hasSession: !!session, user: session?.user?.email });
        
        // Don't auto-login for password recovery sessions
        if (event === 'PASSWORD_RECOVERY') {
          console.log('AuthPage - Preventing auto-login for PASSWORD_RECOVERY event');
          return;
        }
        
        setSession(session);
        if (session?.user && event !== 'SIGNED_OUT') {
          console.log('AuthPage - Calling onAuthSuccess for user:', session.user.email);
          onAuthSuccess(session.user);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Don't auto-login if this is a password recovery session
      const urlParams = new URLSearchParams(window.location.search);
      const isPasswordRecovery = urlParams.get('type') === 'recovery';
      
      console.log('AuthPage - Initial session check:', { 
        hasSession: !!session, 
        user: session?.user?.email, 
        isPasswordRecovery,
        currentPath: window.location.pathname 
      });
      
      setSession(session);
      if (session?.user && !isPasswordRecovery) {
        console.log('AuthPage - Auto-logging in existing user:', session.user.email);
        onAuthSuccess(session.user);
      } else if (isPasswordRecovery) {
        console.log('AuthPage - Skipping auto-login due to password recovery');
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