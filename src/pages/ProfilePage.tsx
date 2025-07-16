import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Edit } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";

interface Profile {
  full_name: string;
  phone_number: string;
  date_of_birth: string;
  created_at: string;
  avatar_url?: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone_number: "",
    date_of_birth: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({ title: "Authentication Error", variant: "destructive" });
        navigate("/");
        return;
      }
      setUser(user);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        toast({ title: "Error Loading Profile", variant: "destructive" });
      } else {
        setProfile(data);
        const [firstName, ...lastName] = (data.full_name || "").split(" ");
        setFormData({
          firstName: firstName || "",
          lastName: lastName.join(" ") || "",
          phone_number: data.phone_number || "",
          date_of_birth: data.date_of_birth || "",
        });
      }
      setIsLoading(false);
    };
    fetchUserProfile();
  }, [navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const full_name = `${formData.firstName} ${formData.lastName}`.trim();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name,
        phone_number: formData.phone_number,
        date_of_birth: formData.date_of_birth,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile Updated Successfully" });
      setProfile((prev) => (prev ? { ...prev, full_name, ...formData } : null));
      setIsEditing(false);
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (!user || !profile) return <div className="flex items-center justify-center h-screen">Could not load profile.</div>;

  const userInitial = formData.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?";
  const displayName = `${formData.firstName} ${formData.lastName}`.trim();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-6 left-6">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>

      <Card className="w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={profile.avatar_url || undefined} alt="User Avatar" />
              <AvatarFallback className="text-3xl">{userInitial}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{displayName}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="flex gap-4">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={formData.firstName} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={formData.lastName} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input id="phone_number" value={formData.phone_number} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input type="date" id="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <DetailItem label="Full Name" value={displayName} />
                <DetailItem label="Phone Number" value={profile.phone_number} />
                <DetailItem label="Date of Birth" value={profile.date_of_birth} />
              </div>
            )}
            <DetailItem label="Account Created" value={new Date(profile.created_at).toLocaleDateString()} />
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6">
            {isEditing ? (
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string | undefined }) => (
  <div className="flex justify-between items-center py-2">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-sm font-medium">{value || "N/A"}</p>
  </div>
);

export default ProfilePage;
