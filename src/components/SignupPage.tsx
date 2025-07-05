import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Country codes data
const COUNTRY_CODES = [
  { code: "+1", country: "US", flag: "🇺🇸", length: 10 },
  { code: "+91", country: "IN", flag: "🇮🇳", length: 10 },
  { code: "+44", country: "UK", flag: "🇬🇧", length: 10 },
  { code: "+49", country: "DE", flag: "🇩🇪", length: 11 },
  { code: "+33", country: "FR", flag: "🇫🇷", length: 10 },
  { code: "+81", country: "JP", flag: "🇯🇵", length: 10 },
  { code: "+86", country: "CN", flag: "🇨🇳", length: 11 },
  { code: "+61", country: "AU", flag: "🇦🇺", length: 9 },
  { code: "+7", country: "RU", flag: "🇷🇺", length: 10 },
  { code: "+55", country: "BR", flag: "🇧🇷", length: 11 },
];

interface SignupPageProps {
  onBackToLogin: () => void;
}

const SignupPage = ({ onBackToLogin }: SignupPageProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+91",
    phoneNumber: "",
    dateOfBirth: undefined as Date | undefined,
    password: "",
    confirmPassword: ""
  });

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

  const passwordStrength = calculatePasswordStrength(formData.password);

  const handleInputChange = (field: string, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Format phone number to only allow numbers
  const handlePhoneChange = (value: string) => {
    const numbersOnly = value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, phoneNumber: numbersOnly }));
  };

  // Validate phone number based on country
  const validatePhoneNumber = () => {
    if (!formData.phoneNumber) return true; // Optional field
    const countryData = COUNTRY_CODES.find(c => c.code === formData.countryCode);
    if (!countryData) return false;
    return formData.phoneNumber.length === countryData.length;
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Reset Link Sent",
          description: "Check your email for the password reset link"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reset email",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    if (!validatePhoneNumber()) {
      const countryData = COUNTRY_CODES.find(c => c.code === formData.countryCode);
      toast({
        title: "Invalid Phone Number",
        description: `Phone number must be exactly ${countryData?.length} digits for ${countryData?.country}`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            phone_number: formData.phoneNumber ? `${formData.countryCode}${formData.phoneNumber}` : null,
            date_of_birth: formData.dateOfBirth ? format(formData.dateOfBirth, 'yyyy-MM-dd') : null
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
          title: "Success!",
          description: "Please check your email to confirm your account",
        });
        onBackToLogin();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen max-h-screen overflow-hidden bg-background flex items-center justify-center p-4">
      {/* Logo in top left */}
      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm transform rotate-45"></div>
          </div>
          <span className="text-foreground font-semibold text-lg">PLAMENTO</span>
        </div>
      </div>

      {/* Main signup card */}
      <Card className="w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBackToLogin}
              className="absolute left-4"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
          <h1 className="text-2xl font-semibold text-card-foreground mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground text-sm">
            Fill in your details to get started
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-card-foreground">
                  First Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-card-foreground">
                  Last Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-card-foreground">
                Email Address <span className="text-destructive">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-sm font-medium text-card-foreground">
                Phone Number <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                <Select
                  value={formData.countryCode}
                  onValueChange={(value) => handleInputChange("countryCode", value)}
                >
                  <SelectTrigger className="w-[120px] h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.code}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="h-12 flex-1"
                  required
                />
              </div>
              {formData.phoneNumber && !validatePhoneNumber() && (
                <p className="text-sm text-destructive">
                  Invalid phone number length for selected country
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="dateOfBirth" className="text-sm font-medium text-card-foreground">
                Date of Birth <span className="text-destructive">*</span>
              </label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-12 justify-start text-left font-normal",
                      !formData.dateOfBirth && "text-muted-foreground"
                    )}
                  >
                    {formData.dateOfBirth ? (
                      format(formData.dateOfBirth, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dateOfBirth}
                    onSelect={(date) => {
                      handleInputChange("dateOfBirth", date);
                      setDatePickerOpen(false);
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-card-foreground">
                Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
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
              {formData.password && (
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
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className="h-12"
                required
              />
            </div>

            <Button
              type="submit"
              variant="login"
              className="w-full h-12 mt-6"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign in link */}
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button 
                onClick={onBackToLogin}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;