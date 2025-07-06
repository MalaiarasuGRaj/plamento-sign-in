import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const { toast } = useToast();

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
      onLogout(); // Still call onLogout to clear the UI state
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm transform rotate-45"></div>
          </div>
          <span className="text-foreground font-semibold text-lg">PLAMENTO</span>
        </div>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>

      {/* Welcome Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Welcome to Plamento! 🎉
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            You have successfully signed in to your account.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium">Logged in as:</p>
            <p className="text-primary">{user.email}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Your profile data has been stored securely in the database.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;