/*
  # Fix authentication database error

  1. Database Functions
    - Create or replace the handle_new_user function to properly create profiles
    - Ensure the function has proper security and error handling

  2. Triggers
    - Create trigger on auth.users to automatically create profile entries
    - Handle any potential conflicts or errors gracefully

  3. Security
    - Ensure RLS policies allow profile creation during signup
    - Add policy for service role to insert profiles during trigger execution
*/

-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert a new profile for the user
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add RLS policy to allow service role to insert profiles during trigger execution
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Service role can insert profiles'
  ) THEN
    CREATE POLICY "Service role can insert profiles"
      ON profiles
      FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END $$;

-- Ensure authenticated users can insert their own profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;