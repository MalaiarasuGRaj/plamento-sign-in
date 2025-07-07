import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength === 0) return "";
    if (strength <= 25) return "Weak";
    if (strength <= 50) return "Fair";
    if (strength <= 75) return "Good";
    return "Strong";
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 25) return "bg-destructive";
    if (strength <= 50) return "bg-yellow-500";
    if (strength <= 75) return "bg-blue-500";
    return "bg-green-500";
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  useEffect(() => {
    // Check if we have the required parameters from Supabase reset link
    const token = searchParams.get('access_token');
    const refresh = searchParams.get('refresh_token'); 
    const type = searchParams.get('type');
    
    // Also check for alternative parameter names that Supabase might use
    const tokenHash = searchParams.get('token_hash');
    const tokenParam = searchParams.get('token');

    // If we have the standard tokens, use them
    if (token && refresh && type === 'recovery') {
      setAccessToken(token);
      setRefreshToken(refresh);
      return;
    }
    
    // If we have token_hash or token (alternative Supabase format), handle it
    if ((tokenHash || tokenParam) && type === 'recovery') {
      // For these cases, we'll handle the reset without pre-storing tokens
      // The session will be established when the user submits the form
      return;
    }

    // If no valid parameters, show error and redirect
    toast({
      title: "Invalid Reset Link",
      description: "The reset link is invalid or has expired. Please request a new one.",
      variant: "destructive"
    });
    navigate('/');
  }, [searchParams, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get URL parameters for token handling
      const token = searchParams.get('access_token');
      const refresh = searchParams.get('refresh_token');
      const tokenHash = searchParams.get('token_hash');
      const tokenParam = searchParams.get('token');
      const type = searchParams.get('type');

      if (type !== 'recovery') {
        toast({
          title: "Error",
          description: "Invalid reset session. Please request a new reset link.",
          variant: "destructive"
        });
        return;
      }

      // Try different approaches based on available tokens
      if (token && refresh) {
        // Standard token approach
        await supabase.auth.setSession({
          access_token: token,
          refresh_token: refresh
        });
      } else if (tokenHash) {
        // Token hash approach - verify the session first
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery'
        });
        
        if (error) {
          toast({
            title: "Error",
            description: "Invalid or expired reset link. Please request a new one.",
            variant: "destructive"
          });
          return;
        }
      } else {
        toast({
          title: "Error",
          description: "Invalid reset session. Please request a new reset link.",
          variant: "destructive"
        });
        return;
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Sign out user after password update to prevent auto-login
        await supabase.auth.signOut();
        
        setIsSuccess(true);
        toast({
          title: "Success!",
          description: "Your password has been updated successfully."
        });
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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

        {/* Success card */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-semibold text-card-foreground mb-2">
              Password Updated!
            </h1>
            <p className="text-muted-foreground text-sm">
              Your password has been successfully updated. You will be redirected to the login page shortly.
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/')}
              className="w-full h-12"
              variant="login"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      {/* Main reset card */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Lock className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-card-foreground mb-2">
            Reset Your Password
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter your new password below
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-card-foreground">
                New Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-card-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Password Strength:</span>
                    <span className={cn(
                      "font-medium",
                      passwordStrength <= 25 && "text-destructive",
                      passwordStrength > 25 && passwordStrength <= 50 && "text-yellow-600",
                      passwordStrength > 50 && passwordStrength <= 75 && "text-blue-600",
                      passwordStrength > 75 && "text-green-600"
                    )}>
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        getPasswordStrengthColor(passwordStrength)
                      )}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-card-foreground">
                Confirm Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-card-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="login"
              className="w-full h-12 mt-6"
              disabled={isLoading}
            >
              {isLoading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>

          <div className="text-center pt-4">
            <button 
              onClick={() => navigate('/')}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              Back to Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;