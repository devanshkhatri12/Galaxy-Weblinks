// /**
//  * Sign Up Form Component
//  *
//  * A client-side form that handles user registration.
//  * Includes password strength validation and terms agreement.
//  */

// "use client";

// import React from "react";

// import { useState, useRef, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardFooter } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Eye, EyeOff, Loader2, AlertCircle, Check, X } from "lucide-react";
// import { createClient } from "@/lib/supabase/client";

// // Password validation rules
// function validatePassword(password: string) {
//   return {
//     minLength: password.length >= 8,
//     hasUppercase: /[A-Z]/.test(password),
//     hasLowercase: /[a-z]/.test(password),
//     hasNumber: /[0-9]/.test(password),
//   };
// }

// export function SignUpForm() {
//   // Form state
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [agreeToTerms, setAgreeToTerms] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);
//   const [captchaToken, setCaptchaToken] = useState<string | null>(null);

//   const router = useRouter();
//   const captchaRef = useRef<HTMLDivElement>(null);
//   const captchaInstanceRef = useRef<any>(null);

//   // Initialize hCaptcha
//   useEffect(() => {
//     const loadHCaptcha = async () => {
//       // Load hCaptcha script
//       if (!(window as any).hcaptcha) {
//         const script = document.createElement("script");
//         script.src = "https://js.hcaptcha.com/1/api.js";
//         script.async = true;
//         script.defer = true;
//         document.body.appendChild(script);

//         script.onload = () => {
//           if (captchaRef.current) {
//             captchaInstanceRef.current = (window as any).hcaptcha.render(
//               captchaRef.current,
//               {
//                 sitekey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "",
//                 theme: "light",
//                 callback: handleCaptchaChange,
//               },
//             );
//           }
//         };
//       } else if (captchaRef.current && !captchaInstanceRef.current) {
//         captchaInstanceRef.current = (window as any).hcaptcha.render(
//           captchaRef.current,
//           {
//             sitekey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "",
//             theme: "light",
//             callback: handleCaptchaChange,
//           },
//         );
//       }
//     };

//     loadHCaptcha();
//   }, []);

//   // Handle CAPTCHA response
//   const handleCaptchaChange = (token: string) => {
//     setCaptchaToken(token);
//   };

//   // Get password validation status
//   const passwordValidation = validatePassword(password);
//   const isPasswordValid = Object.values(passwordValidation).every(Boolean);
//   const passwordsMatch = password === confirmPassword && confirmPassword !== "";

//   // Handle form submission
//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setIsLoading(true);

//     try {
//       // Check if CAPTCHA is completed
//       if (!captchaToken) {
//         setError("Please complete the CAPTCHA");
//         setIsLoading(false);
//         return;
//       }

//       // Validation
//       if (!firstName || !lastName || !email || !password || !confirmPassword) {
//         setError("Please fill in all fields");
//         setIsLoading(false);
//         return;
//       }

//       if (!isPasswordValid) {
//         setError("Please ensure your password meets all requirements");
//         setIsLoading(false);
//         return;
//       }

//       if (!passwordsMatch) {
//         setError("Passwords do not match");
//         setIsLoading(false);
//         return;
//       }

//       if (!agreeToTerms) {
//         setError("You must agree to the terms and conditions");
//         setIsLoading(false);
//         return;
//       }

//       // Create Supabase client and sign up
//       const supabase = createClient();
//       const { data, error: authError } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//           data: {
//             first_name: firstName,
//             last_name: lastName,
//           },
//           emailRedirectTo:
//             process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
//             `${window.location.origin}/auth/callback`,
//         },
//       });

//       if (authError) {
//         setError(authError.message);
//         setIsLoading(false);

//         // Reset CAPTCHA on error
//         if (captchaInstanceRef.current) {
//           captchaInstanceRef.current.reset();
//         }

//         if (window.hcaptcha && captchaInstanceRef.current !== null) {
//         window.hcaptcha.reset(captchaInstanceRef.current)
//         }
//         setCaptchaToken(null);
//         return;
//       }

//       // Show success message
//       setSuccess(true);
//     } catch (err) {
//       setError("An unexpected error occurred. Please try again.");
//       setIsLoading(false);
//       // Reset CAPTCHA on error
//       if (captchaInstanceRef.current) {
//         captchaInstanceRef.current.reset();
//       }
//       setCaptchaToken(null);
//     }
//   }

//   // Success state - show confirmation message
//   if (success) {
//     return (
//       <Card className="border-0 shadow-lg">
//         <CardContent className="pt-6">
//           <div className="text-center py-6">
//             <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
//               <Check className="h-6 w-6 text-green-600" />
//             </div>
//             <h3 className="text-lg font-semibold mb-2">Check your email</h3>
//             <p className="text-muted-foreground text-sm">
//               We&apos;ve sent a verification link to <strong>{email}</strong>.
//               Please click the link to verify your account.
//             </p>
//           </div>
//         </CardContent>
//         <CardFooter className="flex flex-col gap-2">
//           <Button
//             variant="outline"
//             className="w-full bg-transparent"
//             onClick={() => router.push("/auth/login")}
//           >
//             Back to login
//           </Button>
//         </CardFooter>
//       </Card>
//     );
//   }

//   return (
//     <Card className="border-0 shadow-lg">
//       <form onSubmit={handleSubmit}>
//         <CardContent className="pt-6 space-y-4">
//           {/* Error message */}
//           {error && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}

//           {/* Name fields in a row */}
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="firstName">First name</Label>
//               <Input
//                 id="firstName"
//                 type="text"
//                 placeholder="Ram"
//                 value={firstName}
//                 onChange={(e) => setFirstName(e.target.value)}
//                 disabled={isLoading}
//                 required
//                 autoComplete="given-name"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="lastName">Last name</Label>
//               <Input
//                 id="lastName"
//                 type="text"
//                 placeholder="kumar"
//                 value={lastName}
//                 onChange={(e) => setLastName(e.target.value)}
//                 disabled={isLoading}
//                 required
//                 autoComplete="family-name"
//               />
//             </div>
//           </div>

//           {/* Email field */}
//           <div className="space-y-2">
//             <Label htmlFor="email">Email address</Label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="xyz@gmail.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               disabled={isLoading}
//               required
//               autoComplete="email"
//             />
//           </div>

//           {/* Password field */}
//           <div className="space-y-2">
//             <Label htmlFor="password">Password</Label>
//             <div className="relative">
//               <Input
//                 id="password"
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Create a strong password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 disabled={isLoading}
//                 required
//                 autoComplete="new-password"
//                 className="pr-10"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
//                 tabIndex={-1}
//               >
//                 {showPassword ? (
//                   <EyeOff className="h-4 w-4" />
//                 ) : (
//                   <Eye className="h-4 w-4" />
//                 )}
//                 <span className="sr-only">
//                   {showPassword ? "Hide" : "Show"} password
//                 </span>
//               </button>
//             </div>

//             {/* Password requirements */}
//             {password && (
//               <div className="mt-2 space-y-1 text-xs">
//                 <PasswordRequirement
//                   met={passwordValidation.minLength}
//                   text="At least 8 characters"
//                 />
//                 <PasswordRequirement
//                   met={passwordValidation.hasUppercase}
//                   text="One uppercase letter"
//                 />
//                 <PasswordRequirement
//                   met={passwordValidation.hasLowercase}
//                   text="One lowercase letter"
//                 />
//                 <PasswordRequirement
//                   met={passwordValidation.hasNumber}
//                   text="One number"
//                 />
//               </div>
//             )}
//           </div>

//           {/* Confirm password field */}
//           <div className="space-y-2">
//             <Label htmlFor="confirmPassword">Confirm password</Label>
//             <div className="relative">
//               <Input
//                 id="confirmPassword"
//                 type={showConfirmPassword ? "text" : "password"}
//                 placeholder="Confirm your password"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 disabled={isLoading}
//                 required
//                 autoComplete="new-password"
//                 className="pr-10"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
//                 tabIndex={-1}
//               >
//                 {showConfirmPassword ? (
//                   <EyeOff className="h-4 w-4" />
//                 ) : (
//                   <Eye className="h-4 w-4" />
//                 )}
//                 <span className="sr-only">
//                   {showConfirmPassword ? "Hide" : "Show"} password
//                 </span>
//               </button>
//             </div>
//             {confirmPassword && (
//               <p
//                 className={`text-xs ${passwordsMatch ? "text-green-600" : "text-destructive"}`}
//               >
//                 {passwordsMatch ? "Passwords match" : "Passwords do not match"}
//               </p>
//             )}
//           </div>

//           {/* Terms agreement */}
//           <div className="flex items-start space-x-2">
//             <Checkbox
//               id="terms"
//               checked={agreeToTerms}
//               onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
//               disabled={isLoading}
//               className="mt-0.5"
//             />
//             <Label
//               htmlFor="terms"
//               className="text-sm font-normal leading-snug cursor-pointer"
//             >
//               I agree to the{" "}
//               <Link href="/terms" className="text-primary hover:underline">
//                 Terms of Service
//               </Link>{" "}
//               and{" "}
//               <Link href="/privacy" className="text-primary hover:underline">
//                 Privacy Policy
//               </Link>
//             </Label>
//           </div>

//           {/* hCaptcha Widget */}
//           <div className="flex justify-center py-4">
//             <div ref={captchaRef}></div>
//           </div>
//         </CardContent>

//         <CardFooter>
//           <Button
//             type="submit"
//             className="w-full"
//             disabled={isLoading || !agreeToTerms}
//             size="lg"
//           >
//             {isLoading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Creating account...
//               </>
//             ) : (
//               "Create account"
//             )}
//           </Button>
//         </CardFooter>
//       </form>
//     </Card>
//   );
// }

// // Helper component for password requirements
// function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
//   return (
//     <div
//       className={`flex items-center gap-1.5 ${met ? "text-green-600" : "text-muted-foreground"}`}
//     >
//       {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
//       <span>{text}</span>
//     </div>
//   );
// }






/**
 * Sign Up Form Component
 *
 * A client-side form that handles user registration.
 * Includes password strength validation and terms agreement.
 */




"use client";

declare global {
  interface Window {
    hcaptcha: any
  }
}

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
import { Eye, EyeOff, Loader2, AlertCircle, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Password validation rules
function validatePassword(password: string) {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
}

export function SignUpForm() {
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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
          if (captchaRef.current && captchaInstanceRef.current === null) {
            captchaInstanceRef.current = window.hcaptcha.render(
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

  // Get password validation status
  const passwordValidation = validatePassword(password);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Check if CAPTCHA is completed
      if (!captchaToken) {
        setError("Please complete the CAPTCHA");
        setIsLoading(false);
        return;
      }

      // Validation
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        setError("Please fill in all fields");
        setIsLoading(false);
        return;
      }

      if (!isPasswordValid) {
        setError("Please ensure your password meets all requirements");
        setIsLoading(false);
        return;
      }

      if (!passwordsMatch) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      if (!agreeToTerms) {
        setError("You must agree to the terms and conditions");
        setIsLoading(false);
        return;
      }

      // Create Supabase client and sign up
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/callback`,
        },
      });

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

      // Show success message
      setSuccess(true);
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

  // Success state - show confirmation message
  if (success) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Check your email</h3>
            <p className="text-muted-foreground text-sm">
              We&apos;ve sent a verification link to <strong>{email}</strong>.
              Please click the link to verify your account.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => router.push("/auth/login")}
          >
            Back to login
          </Button>
        </CardFooter>
      </Card>
    );
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

          {/* Name fields in a row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Ram"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="kumar"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="family-name"
              />
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="xyz@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="email"
            />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="new-password"
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
                  {showPassword ? "Hide" : "Show"} password
                </span>
              </button>
            </div>

            {/* Password requirements */}
            {password && (
              <div className="mt-2 space-y-1 text-xs">
                <PasswordRequirement
                  met={passwordValidation.minLength}
                  text="At least 8 characters"
                />
                <PasswordRequirement
                  met={passwordValidation.hasUppercase}
                  text="One uppercase letter"
                />
                <PasswordRequirement
                  met={passwordValidation.hasLowercase}
                  text="One lowercase letter"
                />
                <PasswordRequirement
                  met={passwordValidation.hasNumber}
                  text="One number"
                />
              </div>
            )}
          </div>

          {/* Confirm password field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showConfirmPassword ? "Hide" : "Show"} password
                </span>
              </button>
            </div>
            {confirmPassword && (
              <p
                className={`text-xs ${passwordsMatch ? "text-green-600" : "text-destructive"}`}
              >
                {passwordsMatch ? "Passwords match" : "Passwords do not match"}
              </p>
            )}
          </div>

          {/* Terms agreement */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
              disabled={isLoading}
              className="mt-0.5"
            />
            <Label
              htmlFor="terms"
              className="text-sm font-normal leading-snug cursor-pointer"
            >
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
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
            disabled={isLoading || !agreeToTerms}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// Helper component for password requirements
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div
      className={`flex items-center gap-1.5 ${met ? "text-green-600" : "text-muted-foreground"}`}
    >
      {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      <span>{text}</span>
    </div>
  );
}
