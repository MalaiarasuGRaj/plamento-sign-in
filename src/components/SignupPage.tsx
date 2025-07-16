import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SignupPageProps {
  onBackToLogin: () => void;
}

const SignupPage = ({ onBackToLogin }: SignupPageProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+91",
    phoneNumber: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: ""
  });

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: "https://preview--plamento-sign-in-wizard.lovable.app/reset-password",
        data: {
          full_name: `${formData.firstName} ${formData.lastName}`,
          phone_number: `${formData.countryCode}${formData.phoneNumber}`,
          date_of_birth: formData.dateOfBirth
        }
      }
    });

    if (error) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signup Successful",
        description: "Check your email to verify your account."
      });
      onBackToLogin();
    }

    setIsLoading(false);
  };

  // ✅ Password validation helpers
  const password = formData.password;
  const criteria = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password)
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center pb-4">
          <h1 className="text-2xl font-semibold mb-2">Create Account</h1>
          <p className="text-muted-foreground text-sm">Sign up to Plamento</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                required
              />
              <Input
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
              />
            </div>
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
            <div className="flex gap-2">
              <select
                className="border px-2 py-2 rounded-md bg-background"
                value={formData.countryCode}
                onChange={(e) => handleInputChange("countryCode", e.target.value)}
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
              </select>
              <Input
                type="tel"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              />
            </div>
            <Input
              type="date"
              placeholder="Date of Birth"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            />

            {/* ✅ Password Field */}
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
            />

            {/* ✅ Password Criteria */}
            {formData.password && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">Password Requirements:</p>
                <ul className="space-y-1">
                  <li className={criteria.length ? "text-green-600" : "text-muted-foreground"}>• At least 8 characters</li>
                  <li className={criteria.upper ? "text-green-600" : "text-muted-foreground"}>• One uppercase letter</li>
                  <li className={criteria.lower ? "text-green-600" : "text-muted-foreground"}>• One lowercase letter</li>
                  <li className={criteria.number ? "text-green-600" : "text-muted-foreground"}>• One number</li>
                  <li className={criteria.special ? "text-green-600" : "text-muted-foreground"}>• One special character (!@#$%^&*)</li>
                </ul>
              </div>
            )}

            <Input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              required
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="text-center pt-4">
            <button
              onClick={onBackToLogin}
              className="text-sm text-primary hover:underline"
            >
              Already have an account? Sign in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;
