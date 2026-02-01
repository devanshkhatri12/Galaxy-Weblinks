-- ============================================================
-- FIX: REMOVE INFINITE RECURSION POLICIES FROM PROFILES TABLE
-- ============================================================
-- 
-- The policies that check "EXISTS SELECT FROM profiles" while
-- accessing profiles cause infinite recursion. This script removes
-- those problematic policies and replaces them with safe alternatives.

-- Step 1: Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are visible" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;

-- Step 2: Create new safe policies without recursion

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 4: Admins can view all profiles
-- Direct role check without recursion - admins have role_id 2
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    (SELECT role_id FROM public.profiles WHERE id = auth.uid()) = 3
  );

-- Policy 5: Admins can update all profiles
-- Direct role check without recursion - admins have role_id 3
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    (SELECT role_id FROM public.profiles WHERE id = auth.uid()) = 3
  )
  WITH CHECK (
    (SELECT role_id FROM public.profiles WHERE id = auth.uid()) = 3
  );

-- ============================================================
-- FIXED: MANAGER POLICIES - Remove recursion
-- ============================================================

-- Drop old problematic manager policies
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;

-- Policy 6: Managers can view all profiles
-- Managers have role_id = 2, so check if current user's role_id = 2
CREATE POLICY "Managers can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    (SELECT role_id FROM public.profiles WHERE id = auth.uid()) = 2
  );

-- ============================================================
-- REFERENCE: Role IDs
-- ============================================================
-- role_id = 1: user
-- role_id = 2: manager  
-- role_id = 3: admin
