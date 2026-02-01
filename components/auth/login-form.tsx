/**
 * Login Form Component
 *
 * A client-side form that handles user login.
 */

"use client";

import React from "react";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const router = useRouter();
  const captchaRef = useRef<HTMLDivElement>(null);
  const captchaInstanceRef = useRef<any>(null);

  // Initialize hCaptcha
  useEffect(() => {
    const loadHCaptcha = async () => {
      // Load hCaptcha script
      if (!(window as any).hcaptcha) {
        const script = document.createElement("script");
        script.src = "https://js.hcaptcha.com/1/api.js";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        script.onload = () => {
          if (captchaRef.current) {
            captchaInstanceRef.current = (window as any).hcaptcha.render(
              captchaRef.current,
              {
                sitekey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "",
                theme: "light",
                callback: handleCaptchaChange,
              },
            );
          }
        };
      } else if (captchaRef.current && !captchaInstanceRef.current) {
        captchaInstanceRef.current = (window as any).hcaptcha.render(
          captchaRef.current,
          {
            sitekey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "",
            theme: "light",
            callback: handleCaptchaChange,
          },
        );
      }
    };

    loadHCaptcha();
  }, []);

  // Handle CAPTCHA response
  const handleCaptchaChange = (token: string) => {
    setCaptchaToken(token);
  };

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Basic validation
      if (!email || !password) {
        setError("Please fill in all fields");
        setIsLoading(false);
        return;
      }

      // Check if CAPTCHA is completed
      if (!captchaToken) {
        setError("Please complete the CAPTCHA");
        setIsLoading(false);
        return;
      }

      // Create Supabase client and attempt login
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        },
      );

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        // Reset CAPTCHA on error
        if (captchaInstanceRef.current) {
          captchaInstanceRef.current.reset();
        }
        setCaptchaToken(null);
        return;
      }

      // Success! Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
      // Reset CAPTCHA on error
      if (captchaInstanceRef.current) {
        captchaInstanceRef.current.reset();
      }
      setCaptchaToken(null);
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="email"
            />
          </div>

          {/* Password field with show/hide toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </button>
            </div>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              disabled={isLoading}
            />
            <Label
              htmlFor="remember"
              className="text-sm font-normal cursor-pointer"
            >
              Remember me for 30 days
            </Label>
          </div>

          {/* hCaptcha Widget */}
          <div className="flex justify-center py-4">
            <div ref={captchaRef}></div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
