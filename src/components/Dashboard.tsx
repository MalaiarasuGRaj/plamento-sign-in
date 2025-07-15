import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import UserDropdown from "./UserDropdown";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

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
        onLogout();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout",
        variant: "destructive"
      });
      console.error("Logout failed:", error);
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 relative">
      {/* ✅ PLAMENTO Logo (Top-Left) */}
      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm transform rotate-45"></div>
          </div>
          <span className="text-foreground font-semibold text-lg">PLAMENTO</span>
        </div>
      </div>

      {/* ✅ User Dropdown (Top-Right) */}
      <div className="absolute top-6 right-6 z-10">
        <UserDropdown user={user} onLogout={handleLogout} />
      </div>

      {/* ✅ Welcome Title */}
      <h1 className="text-2xl text-center text-foreground mt-20 mb-8">
        Welcome to Plamento! 🎉
      </h1>

      {/* ✅ 4 Boxes in 2x2 Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mx-auto max-w-2xl mt-8">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="w-64 h-36 bg-card rounded-lg shadow-md">
            {/* Optional: Add content inside each box */}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
