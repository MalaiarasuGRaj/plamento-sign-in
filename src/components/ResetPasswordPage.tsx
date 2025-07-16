import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Establish session on password reset
  useEffect(() => {
    const access_token = searchParams.get("access_token");
    const refresh_token = searchParams.get("refresh_token");
    const type = searchParams.get("type");

    if (access_token && refresh_token && type === "recovery") {
      supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
        if (error) {
          toast({
            title: "Session Error",
            description: "Reset link is invalid or expired.",
            variant: "destructive",
          });
          navigate("/");
        }
      });
    }
  }, [searchParams, toast, navigate]);

  const validatePassword = (pwd: string) => {
    const issues = [];
    if (pwd.length < 8) issues.push("At least 8 characters");
    if (!/[A-Z]/.test(pwd)) issues.push("One uppercase letter");
    if (!/[a-z]/.test(pwd)) issues.push("One lowercase letter");
    if (!/[0-9]/.test(pwd)) issues.push("One number");
    if (!/[!@#$%^&*]/.test(pwd)) issues.push("One special character");
    return issues;
  };

  const handleReset = async () => {
    if (password !== confirm) {
      toast({
        title: "Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    const errors = validatePassword(password);
    if (errors.length > 0) {
      toast({
        title: "Weak Password",
        description: errors.join(" • "),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Password updated successfully. Please log in.",
      });
      await supabase.auth.signOut();
      navigate("/");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-lg shadow-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Lock className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold">Reset Your Password</h1>
          <p className="text-sm text-zinc-400">Enter a new password below.</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* New Password */}
          <div>
            <label className="text-sm mb-1 block">New Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 bg-zinc-800 text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm mb-1 block">Confirm Password</label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="pr-10 bg-zinc-800 text-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Criteria */}
          {password && (
            <div className="text-xs text-zinc-400 space-y-1">
              <p className="font-medium">Password must include:</p>
              <ul className="list-disc list-inside space-y-1">
                <li className={password.length >= 8 ? "text-green-400" : ""}>At least 8 characters</li>
                <li className={/[A-Z]/.test(password) ? "text-green-400" : ""}>One uppercase letter</li>
                <li className={/[a-z]/.test(password) ? "text-green-400" : ""}>One lowercase letter</li>
                <li className={/[0-9]/.test(password) ? "text-green-400" : ""}>One number</li>
                <li className={/[!@#$%^&*]/.test(password) ? "text-green-400" : ""}>One special character</li>
              </ul>
            </div>
          )}

          {/* Button */}
          <Button onClick={handleReset} className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Update Password"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
