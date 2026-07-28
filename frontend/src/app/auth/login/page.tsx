"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  BookOpen,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@vellum.edu");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      await useAuthStore.getState().login(email, password);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 400);
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-900 px-4 py-12">
      
      {/* Brand Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-slate-900 text-white rounded-lg">
          <BookOpen className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">
          Vellum LMS
        </span>
      </div>

      {/* Main Login Card */}
      <Card className="w-full max-w-[420px] bg-white border border-slate-200/80 shadow-sm rounded-xl">
        <CardHeader className="space-y-1.5 pb-6">
          <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">
            Sign in
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            Enter your email and password to access your courses.
            Demo: admin@vellum.edu / password
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isSuccess ? (
            <div className="p-6 rounded-lg border border-emerald-200 bg-emerald-50/50 text-emerald-800 flex flex-col items-center text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              <div className="font-semibold text-base">Verification Successful</div>
              <p className="text-sm text-emerald-700">
                Redirecting to your dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Error Alert Box */}
              {error && (
                <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Input Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-slate-700">
                  Email address
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-9 h-10 border-slate-200 bg-slate-50/50 focus-visible:ring-slate-950/10 focus-visible:border-slate-400 rounded-lg text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Password Input Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-medium text-slate-700">
                    Password
                  </Label>
                  <a 
                    href="#" 
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    onClick={(e) => e.preventDefault()}
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-9 pr-10 h-10 border-slate-200 bg-slate-50/50 focus-visible:ring-slate-950/10 focus-visible:border-slate-400 rounded-lg text-slate-900 placeholder:text-slate-400"
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Sign In Action Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-slate-900 text-slate-50 hover:bg-slate-800 font-medium rounded-lg shadow-sm transition-all duration-200 mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="pt-5 pb-6 border-t border-slate-100 flex justify-center bg-slate-50/50 rounded-b-xl">
          <p className="text-xs text-slate-500 text-center">
            New to Vellum?{" "}
            <a 
              href="#" 
              className="text-slate-800 hover:underline hover:text-slate-950 transition-colors font-medium"
              onClick={(e) => e.preventDefault()}
            >
              Contact your institution
            </a>
          </p>
        </CardFooter>
      </Card>
      
    </div>
  );
}
