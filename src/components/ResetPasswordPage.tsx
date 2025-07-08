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
    // Debug: Log all URL parameters to see what Supabase actually sends
    const allParams = Object.fromEntries(searchParams.entries());
    console.log('Reset Password Page - URL params received:', allParams);
    console.log('Current URL:', window.location.href);
    console.log('Hash:', window.location.hash);
    
    // Check if this is a valid reset link by looking for common Supabase reset parameters
    const type = searchParams.get('type');
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const tokenHash = searchParams.get('token_hash');
    
    console.log('Reset parameters check:', { 
      type, 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken,
      hasTokenHash: !!tokenHash
    });
    
    // Allow the page to load if we have any indication this is a reset link
    const hasResetParams = accessToken || tokenHash || type === 'recovery';
    
    if (!hasResetParams && !window.location.href.includes('reset-password')) {
      console.log('No reset parameters found, redirecting to login');
      toast({
        title: "Invalid Reset Link",
        description: "Please use the reset link from your email.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
    
    console.log('Reset password form will be shown');
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
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      console.log('Password update attempt with all params:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken,
        hasTokenHash: !!tokenHash,
        type,
        allParams: Object.fromEntries(searchParams.entries())
      });

      // Handle different types of reset tokens that Supabase might send
      let sessionSet = false;

      // Try approach 1: Standard access_token and refresh_token
      if (accessToken && refreshToken && type === 'recovery') {
        console.log('Attempting session with access/refresh tokens...');
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (!sessionError) {
          console.log('Session set successfully with tokens');
          sessionSet = true;
        } else {
          console.error('Session error with tokens:', sessionError);
        }
      }

      // Try approach 2: Token hash verification (newer Supabase flow)
      if (!sessionSet && tokenHash && type === 'recovery') {
        console.log('Attempting verification with token hash...');
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery'
        });

        if (!error && data.session) {
          console.log('Session verified successfully with token hash');
          sessionSet = true;
        } else {
          console.error('Token hash verification error:', error);
        }
      }

      // Try approach 3: Direct password update if we have a current session
      if (!sessionSet) {
        console.log('Checking current session...');
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('Found existing session');
          sessionSet = true;
        }
      }

      if (!sessionSet) {
        console.log('No valid session could be established');
        toast({
          title: "Error",
          description: "Invalid or expired reset link. Please request a new reset link.",
          variant: "destructive"
        });
        return;
      }

      console.log('Session established, updating password...');

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        toast({
          title: "Error",
          description: updateError.message,
          variant: "destructive"
        });
      } else {
        console.log('Password updated successfully');
        
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
      console.error('Unexpected error:', error);
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