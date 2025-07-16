import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [isSessionReady, setIsSessionReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const access_token = searchParams.get("access_token");
    const refresh_token = searchParams.get("refresh_token");
    const type = searchParams.get("type");

    if (access_token && refresh_token && type === "recovery") {
      supabase.auth.setSession({
        access_token,
        refresh_token,
      }).then(({ error }) => {
        if (error) {
          toast({
            title: "Session Error",
            description: "Reset link is invalid or expired.",
            variant: "destructive",
          });
          navigate("/");
        }
        setIsSessionReady(true);
      });
    } else {
      toast({
        title: "Missing Token",
        description: "Reset token not found. Please use the link from your email.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [searchParams, toast, navigate]);

  const handleReset = async () => {
    if (!isSessionReady) return;

    if (password !== confirm) {
      toast({
        title: "Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        title: "Update Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password Reset",
        description: "Your password has been updated. Please log in.",
      });
      await supabase.auth.signOut();
      navigate("/");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative">
      {/* ✅ PLAMENTO logo in top left */}
      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm transform rotate-45" />
          </div>
          <span className="text-foreground font-semibold text-lg">PLAMENTO</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">Reset Your Password</h1>

      <div className="w-full max-w-md space-y-4 bg-card p-6 rounded-lg shadow">
        <Input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Confirm New Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <Button className="w-full" onClick={handleReset} disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
