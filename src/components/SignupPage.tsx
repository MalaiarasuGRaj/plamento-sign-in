import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { countries } from "@/lib/countries";

interface SignupPageProps {
  onBackToLogin: () => void;
}

const SignupPage = ({ onBackToLogin }: SignupPageProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dob, setDob] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+91",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    if (value.length > 5) {
      value = `${value.slice(0, 5)}/${value.slice(5, 9)}`;
    }
    setDob(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    let dobForSupabase = null;
    if (dob) {
      const dobRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
      if (!dobRegex.test(dob)) {
        toast({
          title: "Invalid Date Format",
          description: "Please enter your date of birth in DD/MM/YYYY format.",
          variant: "destructive",
        });
        return;
      }
      const [day, month, year] = dob.split("/");
      dobForSupabase = `${year}-${month}-${day}`;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/reset-password`,
        data: {
          full_name: `${formData.firstName} ${formData.lastName}`,
          phone_number: `${formData.countryCode}${formData.phoneNumber}`,
          date_of_birth: dobForSupabase,
        },
      },
    });

    if (error) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signup Successful",
        description: "Check your email to verify your account.",
      });
      onBackToLogin();
    }

    setIsLoading(false);
  };

  const password = formData.password;
  const criteria = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
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
            <div className="flex items-center gap-2">
              <select
                className="w-1/3 border px-2 py-2 rounded-md bg-background"
                value={formData.countryCode}
                onChange={(e) =>
                  handleInputChange("countryCode", e.target.value)
                }
              >
                {countries.map((country) => (
                  <option key={country.code} value={`+${country.phone}`}>
                    {country.name} (+{country.phone})
                  </option>
                ))}
              </select>
              <Input
                className="w-2/3"
                type="tel"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
              />
            </div>

            <Input
              type="text"
              placeholder="Enter your date of birth"
              value={dob}
              onChange={handleDobChange}
              onFocus={(e) => {
                e.target.placeholder = "DD/MM/YYYY";
              }}
              onBlur={(e) => {
                e.target.placeholder = "Enter your date of birth";
              }}
              maxLength={10}
            />

            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
            />
            {formData.password && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">Password Requirements:</p>
                <ul className="space-y-1">
                  <li className={criteria.length ? "text-green-600" : ""}>
                    • At least 8 characters
                  </li>
                  <li className={criteria.upper ? "text-green-600" : ""}>
                    • One uppercase letter
                  </li>
                  <li className={criteria.lower ? "text-green-600" : ""}>
                    • One lowercase letter
                  </li>
                  <li className={criteria.number ? "text-green-600" : ""}>
                    • One number
                  </li>
                  <li className={criteria.special ? "text-green-600" : ""}>
                    • One special character (!@#$%^&*)
                  </li>
                </ul>
              </div>
            )}
            <Input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
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
