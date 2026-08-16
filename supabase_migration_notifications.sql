-- UNI-TEL Notifications System Migration
-- This creates a production-ready notifications system

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean NOT NULL DEFAULT false,
  action_url text,
  action_text text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT check_notification_title_length CHECK (length(trim(title)) >= 1 AND length(trim(title)) <= 100),
  CONSTRAINT check_notification_message_length CHECK (length(trim(message)) >= 1 AND length(trim(message)) <= 500)
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON public.notifications(expires_at) WHERE expires_at IS NOT NULL;

-- 3. Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Create function to get unread count
CREATE OR REPLACE FUNCTION public.get_unread_notifications_count(p_user_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM public.notifications
    WHERE user_id = p_user_id AND read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- 6. Create function to mark all as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  UPDATE public.notifications
  SET read = true, updated_at = now()
  WHERE user_id = p_user_id AND read = false;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 7. Create function to clean expired notifications
CREATE OR REPLACE FUNCTION public.clean_expired_notifications()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.notifications
  WHERE expires_at IS NOT NULL AND expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 8. Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_notifications_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_updated_at_trigger
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notifications_updated_at();

-- 9. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_unread_notifications_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clean_expired_notifications() TO authenticated;

-- 10. Create view for notification summary
CREATE OR REPLACE VIEW public.user_notification_summary AS
SELECT 
  user_id,
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE read = false) as unread_count,
  COUNT(*) FILTER (WHERE type = 'info') as info_count,
  COUNT(*) FILTER (WHERE type = 'success') as success_count,
  COUNT(*) FILTER (WHERE type = 'warning') as warning_count,
  COUNT(*) FILTER (WHERE type = 'error') as error_count,
  MAX(created_at) as latest_notification_at
FROM public.notifications
WHERE user_id = auth.uid()
GROUP BY user_id;

-- 11. Enable RLS on view
ALTER VIEW public.user_notification_summary SET (security_invoker = true);

-- 12. Insert some sample notifications for testing
INSERT INTO public.notifications (user_id, title, message, type, action_url, action_text)
SELECT 
  auth.uid(),
  'Welcome to UNI-TEL!',
  'Your academic dashboard is ready. Start by adding your first semester.',
  'info',
  '/semesters',
  'Add Semester'
WHERE auth.uid() IS NOT NULL;

INSERT INTO public.notifications (user_id, title, message, type, action_url, action_text)
SELECT 
  auth.uid(),
  'New Feature Available',
  'Custom exam types and weightages are now available in the Marks section.',
  'info',
  '/marks',
  'Try It Out'
WHERE auth.uid() IS NOT NULL;
