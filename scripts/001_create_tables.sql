-- ============================================================
-- DATABASE SCHEMA FOR FULL-STACK APPLICATION
-- This script creates all the tables needed for:
-- 1. User Profiles (extends Supabase auth.users)
-- 2. User Roles (Admin, Manager, User)
-- 3. Activity Logs (Audit Trail)
-- 4. Contact Form Submissions
-- ============================================================

-- ============================================================
-- TABLE 1: ROLES
-- Stores available roles in the system (Admin, Manager, User)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default roles
INSERT INTO public.roles (name, description) VALUES 
  ('admin', 'Full access to all features and user management'),
  ('manager', 'Can manage content and view reports'),
  ('user', 'Standard user with basic access')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- TABLE 2: PROFILES
-- Extends auth.users with additional user information
-- Links to roles table for role-based access control
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  -- Link to Supabase auth.users (primary key and foreign key)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User's personal information
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  
  -- Profile picture (stored as URL or file path)
  avatar_url TEXT,
  
  -- Role assignment (defaults to 'user' role)
  role_id UUID REFERENCES public.roles(id),
  
  -- Account status
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 3: ACTIVITY_LOGS
-- Records all user actions for audit trail
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who performed the action (can be null for system actions)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- What action was performed
  action TEXT NOT NULL,
  
  -- Additional details about the action (stored as JSON)
  details JSONB,
  
  -- IP address and user agent for security tracking
  ip_address TEXT,
  user_agent TEXT,
  
  -- When the action occurred
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 4: CONTACT_SUBMISSIONS
-- Stores contact form submissions from the Contact Us page
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contact information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  
  -- Status tracking
  status TEXT DEFAULT 'pending', -- pending, read, responded, archived
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- ============================================================
-- TABLE 5: PASSWORD_RESET_TOKENS
-- Stores password reset tokens (Supabase handles this, but
-- we keep it for custom email functionality with Resend)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- This ensures users can only access data they're allowed to
-- ============================================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES FOR ROLES TABLE
-- Everyone can read roles, only admins can modify
-- ============================================================
CREATE POLICY "Anyone can view roles" 
  ON public.roles FOR SELECT 
  USING (true);

-- ============================================================
-- RLS POLICIES FOR PROFILES TABLE
-- Users can read/update their own profile
-- Admins can read/update all profiles
-- ============================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" 
  ON public.profiles FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles" 
  ON public.profiles FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- ============================================================
-- RLS POLICIES FOR ACTIVITY_LOGS TABLE
-- Users can view their own activity
-- Admins can view all activity
-- ============================================================

-- Users can view their own activity logs
CREATE POLICY "Users can view own activity" 
  ON public.activity_logs FOR SELECT 
  USING (auth.uid() = user_id);

-- Anyone can insert activity logs (for tracking)
CREATE POLICY "Anyone can insert activity logs" 
  ON public.activity_logs FOR INSERT 
  WITH CHECK (true);

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity" 
  ON public.activity_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- ============================================================
-- RLS POLICIES FOR CONTACT_SUBMISSIONS TABLE
-- Anyone can submit (insert), only admins can read/manage
-- ============================================================

-- Anyone can submit a contact form (even without login)
CREATE POLICY "Anyone can submit contact form" 
  ON public.contact_submissions FOR INSERT 
  WITH CHECK (true);

-- Only admins can view contact submissions
CREATE POLICY "Admins can view contact submissions" 
  ON public.contact_submissions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Only admins can update contact submissions
CREATE POLICY "Admins can update contact submissions" 
  ON public.contact_submissions FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- ============================================================
-- RLS POLICIES FOR PASSWORD_RESET_TOKENS TABLE
-- Users can only access their own tokens
-- ============================================================

CREATE POLICY "Users can view own reset tokens" 
  ON public.password_reset_tokens FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reset tokens" 
  ON public.password_reset_tokens FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reset tokens" 
  ON public.password_reset_tokens FOR UPDATE 
  USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTION: Auto-create profile when user signs up
-- This runs automatically after a new user is created in auth.users
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_role_id UUID;
BEGIN
  -- Get the 'user' role ID (default role for new signups)
  SELECT id INTO default_role_id FROM public.roles WHERE name = 'user';
  
  -- Create a profile for the new user
  INSERT INTO public.profiles (id, first_name, last_name, role_id, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', NULL),
    default_role_id,
    COALESCE((NEW.raw_user_meta_data ->> 'email_verified')::boolean, FALSE)
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Log the signup activity
  INSERT INTO public.activity_logs (user_id, action, details)
  VALUES (
    NEW.id,
    'user_signup',
    jsonb_build_object('email', NEW.email, 'created_at', NOW())
  );
  
  RETURN NEW;
END;
$$;

-- ============================================================
-- TRIGGER: Run handle_new_user() after user signup
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FUNCTION: Update the updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- TRIGGER: Auto-update updated_at on profiles table
-- ============================================================
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- CREATE STORAGE BUCKET FOR PROFILE AVATARS
-- (This needs to be done via Supabase dashboard or API)
-- ============================================================
-- Note: Storage bucket 'avatars' should be created with:
-- - Public access for reading
-- - Authenticated access for uploading
-- - Max file size: 5MB
-- - Allowed types: image/jpeg, image/png, image/webp
