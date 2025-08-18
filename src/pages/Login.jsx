import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

const API_BASE = import.meta.env.VITE_API_BASE_URL;
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    if (!validateEmail(email)) {
      toast({ title: "Invalid email format", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // Real API call
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.error || res.message || "Login failed");
      }
      localStorage.setItem("auth_token", res.data.token || res.token);
      toast({ title: "Login successful!" });
      navigate("/");
    } catch (err) {
      toast({ title: err.message || "Login failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md rounded-2xl shadow-xl border-0">
        <CardHeader className="flex flex-col items-center gap-2 pt-8 pb-2">
          <div className="bg-blue-100 rounded-full p-4 mb-2">
            <Lock className="w-8 h-8 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <div className="text-muted-foreground text-center text-base font-normal">Sign in to access the admin panel</div>
        </CardHeader>
        <CardContent className="pt-2 pb-4">
          <form className="space-y-5" onSubmit={handleSubmit} autoComplete="on">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                  <Mail className="w-5 h-5" />
                </span>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 bg-blue-50 focus:bg-white"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                  <Lock className="w-5 h-5" />
                </span>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 bg-blue-50 focus:bg-white"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 focus:outline-none"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <Button className="w-full bg-blue-500 hover:bg-blue-600" type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          {/* <div className="mt-6 bg-blue-50 rounded-lg p-4 text-sm text-blue-900">
            <div className="font-semibold mb-1">Demo Credentials:</div>
            <div>Email: <span className="font-mono">admin@ieltswin.com</span></div>
            <div>Password: <span className="font-mono">admin123</span></div>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}