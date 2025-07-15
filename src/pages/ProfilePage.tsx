import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        toast({
          title: "Error",
          description: "Please log in again.",
          variant: "destructive"
        });
        return;
      }

      setUser(data.user);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", data.user.id)
        .single();

      if (profileError) {
        toast({
          title: "Error loading profile",
          description: profileError.message,
          variant: "destructive"
        });
        return;
      }

      setProfile(profileData);
    };

    fetchUser();
  }, [toast]);

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const initial = (profile.full_name?.[0] || user.email?.[0] || "?").toUpperCase();

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

        {/* Initial Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full flex items-center justify-center bg-muted text-foreground text-4xl font-bold border border-border">
            {initial}
          </div>
        </div>

        {/* Profile Info */}
        <div className="space-y-4 text-sm">
          <p><span className="font-medium"> Full Name:</span> {profile.full_name}</p>
          <p><span className="font-medium"> Email:</span> {user.email}</p>
          <p><span className="font-medium"> Phone Number:</span> {profile.phone_number || "Not provided"}</p>
          <p><span className="font-medium"> Date of Birth:</span> {profile.date_of_birth || "N/A"}</p>
          <p><span className="font-medium"> Created On:</span> {new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
