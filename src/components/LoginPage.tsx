import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSignup: () => void;
}

const LoginPage = ({ onLogin, onSignup }: LoginPageProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await onLogin(email, password);
    if (!success) {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Reset Link Sent",
          description: "Check your email for the password reset link"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reset email",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Logo in top left */}
      <div className="absolute top-6 left-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm transform rotate-45"></div>
          </div>
          <span className="text-foreground font-semibold text-lg">PLAMENTO</span>
        </div>
      </div>

      {/* Main login card */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center pb-4">
          <h1 className="text-2xl font-semibold text-card-foreground mb-2">
            Sign in to Plamento
          </h1>
          <div className="flex items-center gap-2 justify-center mb-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          </div>
          <p className="text-muted-foreground text-sm">
            Welcome back! Please sign in to continue
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-card-foreground">
                Email Address <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-card-foreground">
                Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-20"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-card-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-primary hover:text-primary/80 text-sm"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="login"
              className="w-full h-12 mt-6"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Login →"}
            </Button>
          </form>

          {/* Sign up link */}
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button 
                onClick={onSignup}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>© 2025 Plamento</span>
          <span>|</span>
          <button className="hover:text-foreground">Support</button>
          <span>|</span>
          <button className="hover:text-foreground">Privacy</button>
          <span>|</span>
          <button className="hover:text-foreground">Terms</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;