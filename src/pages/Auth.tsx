import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup, login, loading } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignup) {
      // Signup validation
      if (!formData.username || !formData.email || !formData.displayName || !formData.password) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }

      if (formData.password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters",
          variant: "destructive",
        });
        return;
      }

      try {
        await signup(formData.username, formData.email, formData.displayName, formData.password, formData.confirmPassword);
        navigate("/");
      } catch (error) {
        console.error("Signup error:", error);
      }
    } else {
      // Login validation
      if (!formData.username || !formData.password) {
        toast({
          title: "Error",
          description: "Please enter username and password",
          variant: "destructive",
        });
        return;
      }

      try {
        await login(formData.username, formData.password);
        window.location.href = "/";
      } catch (error) {
        console.error("Login error:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Welcome to BitClips</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground">
            {isSignup
              ? "Join millions of creators and viewers"
              : "Sign in to your account to continue"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {isSignup && (
            <>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1.5"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1.5"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  placeholder="John Doe"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="mt-1.5"
                  disabled={loading}
                />
              </div>
            </>
          )}

          {!isSignup && (
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                className="mt-1.5"
                disabled={loading}
              />
            </div>
          )}

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isSignup && (
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full mt-6" disabled={loading}>
            {loading ? "Loading..." : isSignup ? "Create Account" : "Sign In"}
          </Button>
        </form>

        {/* Toggle signup/login */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setFormData({
                  username: "",
                  email: "",
                  displayName: "",
                  password: "",
                  confirmPassword: "",
                });
              }}
              className="text-primary font-medium hover:underline"
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-8 p-4 bg-secondary rounded-lg text-sm">
          <p className="font-semibold mb-2">Demo Credentials</p>
          <p className="text-muted-foreground">
            <strong>Username:</strong> johndoe<br />
            <strong>Password:</strong> password123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
