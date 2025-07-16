// File: src/pages/ProfilePage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast({
          title: "Auth Error",
          description: "Please log in again.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        toast({
          title: "Error loading profile",
          description: profileError.message,
          variant: "destructive",
        });
      }

      if (!profileData) {
        toast({
          title: "Profile Missing",
          description: "No profile record found for this user.",
          variant: "destructive",
        });
      }

      setProfile(profileData);
      setIsLoading(false);
    };

    fetchUserProfile();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const initial =
    profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      {/* Top Left Logo */}
      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm transform rotate-45"></div>
          </div>
          <span className="text-foreground font-semibold text-lg">PLAMENTO</span>
        </div>
      </div>

      {/* Back to Dashboard */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-primary hover:underline"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Profile Section */}
      <div className="max-w-xl mx-auto mt-32 bg-card rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-3xl font-bold text-foreground border border-border">
            {initial}
          </div>
        </div>

        {/* Profile Info */}
        <div className="space-y-3 text-sm">
          <p><strong>Full Name:</strong> {profile?.full_name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Phone:</strong> {profile?.phone_number || "N/A"}</p>
          <p><strong>Date of Birth:</strong> {profile?.date_of_birth || "N/A"}</p>
          <p><strong>Account Created:</strong> {new Date(profile?.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
