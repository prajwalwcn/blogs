"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Shield, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, setAuthToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string[]>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      const response = await apiRequest("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.token) {
        setAuthToken(response.token);
        toast.success("Welcome back!", {
          description: `You've been successfully authenticated.`,
          icon: <Sparkles className="h-4 w-4" />,
        });
        router.push("/admin/dashboard");
      } else {
        const msg = "Invalid response format from server";
        setError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      if (err.errors) {
        setValidationErrors(err.errors);
        toast.error("Validation failed", {
          description: "Please check the highlighted fields below.",
        });
      } else {
        const msg = err.message || "An unexpected error occurred during authentication.";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-green/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-orange/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-6">

          </div>
          
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            Blogs <span className="text-brand-orange">Admin</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            System Console Gateway
          </p>
        </div>

        {/* Login Card */}
        <Card className="relative border border-zinc-200/80 dark:border-zinc-800/85 shadow-2xl shadow-brand-green/5 dark:shadow-zinc-800/30 bg-white/95 dark:bg-zinc-900/60 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-6 border-b border-zinc-150 dark:border-zinc-800/80">
            <CardTitle className="text-xl font-semibold text-zinc-900 dark:text-white">
              Account Login
            </CardTitle>
            <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-6">
              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-300 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Mail className="h-4 w-4 text-zinc-400" />
                  </div>
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 h-11 bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                    error={validationErrors.email?.[0]}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-brand-orange hover:text-brand-orange-hover font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Lock className="h-4 w-4 text-zinc-400" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9 pr-10 h-11 bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                    error={validationErrors.password?.[0]}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-2 pb-6">
              <Button
                type="submit"
                className="w-full h-11 bg-brand-orange hover:bg-brand-orange-hover text-white font-medium shadow-lg shadow-brand-orange/25 hover:shadow-brand-orange/40 transition-all duration-300"
                isLoading={isLoading}
              >
                <span>Sign In</span>
                {!isLoading && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
              
              <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                <span>Secure Sanctum Authentication</span>
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}