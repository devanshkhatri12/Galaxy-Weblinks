/**
 * Authentication Server Actions
 *
 * These are server-side functions that handle user authentication.
 * They run securely on the server and handle:
 * - User login
 * - User registration (sign up)
 * - Password reset requests
 * - Password reset completion
 * - Email verification
 * - User logout
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

// Type definitions for better code clarity
interface AuthResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Log user activity for audit purposes
 *
 * @param userId - The user's ID (optional for failed logins)
 * @param action - What action was performed
 * @param details - Additional details about the action
 */
async function logActivity(
  userId: string | null,
  action: string,
  details: Record<string, unknown> = {},
) {
  const supabase = await createClient();

  await supabase.from("activity_logs").insert({
    user_id: userId,
    action,
    details,
    ip_address: null, // Would be set from request headers in production
  });
}

/**
 * Login Action
 *
 * Authenticates a user with their email and password.
 * Includes CAPTCHA verification for brute-force protection.
 *
 * @param formData - Form data containing email, password, and captchaToken
 */
export async function loginAction(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const captchaToken = formData.get("captchaToken") as string;

  // Basic validation
  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  // Verify CAPTCHA
  if (!captchaToken) {
    await logActivity(null, "LOGIN_FAILED_NO_CAPTCHA", { email });
    return { success: false, error: "CAPTCHA verification is required" };
  }

  const isCaptchaValid = await verifyCaptcha(captchaToken);
  if (!isCaptchaValid) {
    await logActivity(null, "LOGIN_FAILED_INVALID_CAPTCHA", { email });
    return {
      success: false,
      error: "CAPTCHA verification failed. Please try again.",
    };
  }

  const supabase = await createClient();

  // Attempt to sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Log failed login attempt
    await logActivity(null, "LOGIN_FAILED", { email, reason: error.message });
    return { success: false, error: error.message };
  }

  // Log successful login
  await logActivity(data.user.id, "LOGIN_SUCCESS", { email });

  // Refresh the page cache and redirect
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/**
 * Sign Up Action
 *
 * Creates a new user account and sends a verification email.
 *
 * @param formData - Form data containing user details
 */
export async function signUpAction(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  // Validation
  if (!email || !password || !firstName || !lastName) {
    return { success: false, error: "All fields are required" };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  // Password strength check
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return {
      success: false,
      error: "Password must contain uppercase, lowercase, and numbers",
    };
  }

  const supabase = await createClient();

  // Create the user account with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Store additional user data in metadata
      data: {
        first_name: firstName,
        last_name: lastName,
      },
      // Where to redirect after email confirmation
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    await logActivity(null, "SIGNUP_FAILED", { email, reason: error.message });
    return { success: false, error: error.message };
  }

  if (data.user) {
    // Create user profile with default "user" role
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      first_name: firstName,
      last_name: lastName,
      // Get the user role ID from the roles table
      role_id: (
        await supabase.from("roles").select("id").eq("name", "user").single()
      ).data?.id,
      is_active: true,
      email_verified: false,
    });

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      // Continue anyway - user is created even if profile fails
    }

    // Log successful signup
    await logActivity(data.user.id, "SIGNUP_SUCCESS", { email });
  }

  return {
    success: true,
    message: "Please check your email to verify your account",
  };
}

/**
 * Forgot Password Action
 *
 * Sends a password reset email to the user.
 *
 * @param formData - Form data containing the email
 */
export async function forgotPasswordAction(
  formData: FormData,
): Promise<AuthResult> {
  const email = formData.get("email") as string;

  if (!email) {
    return { success: false, error: "Email is required" };
  }

  const supabase = await createClient();

  // Use Supabase's built-in password reset
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password`,
  });

  if (error) {
    // Don't reveal if email exists or not for security
    console.error("Password reset error:", error);
  }

  // Always return success to prevent email enumeration
  await logActivity(null, "PASSWORD_RESET_REQUESTED", { email });

  return {
    success: true,
    message:
      "If an account exists with this email, you will receive a password reset link",
  };
}

/**
 * Reset Password Action
 *
 * Updates the user's password after they click the reset link.
 *
 * @param formData - Form data containing the new password
 */
export async function resetPasswordAction(
  formData: FormData,
): Promise<AuthResult> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { success: false, error: "All fields are required" };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  const supabase = await createClient();

  // Update the password
  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.user) {
    await logActivity(data.user.id, "PASSWORD_RESET_SUCCESS", {});
  }

  return { success: true, message: "Password updated successfully" };
}

/**
 * Change Password Action
 *
 * Allows logged-in users to change their password.
 *
 * @param formData - Form data containing current and new passwords
 */
export async function changePasswordAction(
  formData: FormData,
): Promise<AuthResult> {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "All fields are required" };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "New passwords do not match" };
  }

  if (newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  const supabase = await createClient();

  // First, get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in" };
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) {
    return { success: false, error: "Current password is incorrect" };
  }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  await logActivity(user.id, "PASSWORD_CHANGED", {});

  return { success: true, message: "Password changed successfully" };
}

/**
 * Logout Action
 *
 * Signs out the current user and redirects to home.
 */
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();

  // Get user before signing out for logging
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await logActivity(user.id, "LOGOUT", {});
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Resend Verification Email Action
 *
 * Sends another verification email to the user.
 *
 * @param formData - Form data containing the email
 */
export async function resendVerificationAction(
  formData: FormData,
): Promise<AuthResult> {
  const email = formData.get("email") as string;

  if (!email) {
    return { success: false, error: "Email is required" };
  }

  const supabase = await createClient();

  // Resend the verification email
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: "Verification email sent" };
}
