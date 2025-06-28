/*
  # Create handle_new_user function for automatic profile creation

  1. Function
    - Creates a profile automatically when a new user signs up
    - Triggered by auth.users insert
    - Ensures profile is created immediately after user confirmation

  2. Security
    - Function runs with security definer privileges
    - Only creates profile for the authenticated user
*/

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Only create profile if user is confirmed (email verified)
  IF NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, name, total_xp, level, streak, joined_date, last_login)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', 'Agent'),
      0,
      1,
      0,
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();