"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, AlertCircle, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
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
        toast.success("Authentication successful!", {
          description: `Welcome back, ${response.user?.name || "Admin"}.`,
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
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 overflow-hidden font-sans">
      {/* Dynamic Background Circles */}
      <div className="absolute top-[-30%] left-[-15%] w-[60%] h-[60%] rounded-full bg-brand-green/10 dark:bg-brand-green/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-15%] w-[60%] h-[60%] rounded-full bg-brand-orange/10 dark:bg-brand-orange/20 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-white dark:bg-zinc-900 border border-brand-green/20 dark:border-zinc-800 shadow-xl shadow-brand-green/5 text-brand-orange mb-4 relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-green/20 to-brand-orange/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <ShieldCheck className="h-7 w-7 text-brand-orange relative z-10" />
          </div>
          
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            Blogs <span className="text-brand-orange">Admin</span>
            <span className="text-brand-green">.</span>
          </h1>
          <p className="text-sm font-semibold text-zinc-550 dark:text-zinc-400 mt-2">
            System Console Gateway • Green & Orange Theme
          </p>
        </div>

        {/* Auth Form Card */}
        <Card className="border border-zinc-200/80 dark:border-zinc-800/85 shadow-2xl bg-white/95 dark:bg-zinc-900/60 backdrop-blur-xl transition-all duration-300">
          <CardHeader className="space-y-1.5 pb-6 border-b border-zinc-150 dark:border-zinc-800/80">
            <CardTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              Sign In
            </CardTitle>
            <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400">
              Provide credentials verified in your Laravel administrative database.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-5 pt-6">
              {/* Banner for error notifications */}
              {error && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/30 text-red-650 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}


              {/* Email Address Field */}
              <div className="relative">
                <div className="absolute left-3.5 top-[32px] h-10 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-zinc-450" />
                </div>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 dark:bg-zinc-950/80"
                  error={validationErrors.email?.[0]}
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <div className="absolute left-3.5 top-[32px] h-10 flex items-center pointer-events-none">
                  <KeyRound className="h-4.5 w-4.5 text-zinc-450" />
                </div>
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 dark:bg-zinc-950/80"
                  error={validationErrors.password?.[0]}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-[32px] h-10 flex items-center hover:text-brand-orange text-zinc-450 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pb-8">
              <Button
                type="submit"
                variant="default"
                className="w-full h-11 text-base font-bold bg-brand-orange hover:bg-brand-orange-hover text-white flex items-center justify-center gap-2 group transition-all"
                isLoading={isLoading}
              >
                <span>Authenticate Console</span>
                {!isLoading && (
                  <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
                )}
              </Button>
              
              <div className="w-full flex items-center justify-center gap-1.5 text-xs text-zinc-455 dark:text-zinc-500">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                <span>Sanctum Authorization Secured</span>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
