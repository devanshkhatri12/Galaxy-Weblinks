-- ============================================================
-- MANAGER ROLE PERMISSIONS
-- 
-- Manager role is between Admin and User roles
-- Managers can:
-- - View all activity logs (like admins)
-- - Manage contact submissions (like admins)
-- - Cannot manage users or system settings (unlike admins)
-- ============================================================

-- ============================================================
-- RLS POLICIES FOR ACTIVITY_LOGS TABLE - MANAGER ACCESS
-- ============================================================

-- Managers can view all activity logs (read-only)
CREATE POLICY "Managers can view all activity" 
  ON public.activity_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- ============================================================
-- RLS POLICIES FOR CONTACT_SUBMISSIONS TABLE - MANAGER ACCESS
-- ============================================================

-- Managers can view contact submissions
CREATE POLICY "Managers can view contact submissions" 
  ON public.contact_submissions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- Managers can update contact submissions (change status, add notes)
CREATE POLICY "Managers can update contact submissions" 
  ON public.contact_submissions FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- ============================================================
-- RLS POLICIES FOR PROFILES TABLE - MANAGER ACCESS
-- ============================================================

-- Managers can view all profiles (read-only)
CREATE POLICY "Managers can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- Note: Managers CANNOT update or delete profiles
-- That permission is reserved for admins only
