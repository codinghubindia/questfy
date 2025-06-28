/*
  # Fix profiles table RLS policy for user signup

  1. Security Changes
    - Add separate INSERT policy for profiles table
    - Allow authenticated users to insert their own profile data
    - Keep existing policy for other operations (SELECT, UPDATE, DELETE)

  The current policy blocks INSERT operations during signup because the profile
  doesn't exist yet when trying to create it. This migration adds a specific
  INSERT policy that allows users to create their own profile.
*/

-- Drop the existing overly restrictive policy
DROP POLICY IF EXISTS "Users can only access their own profile" ON profiles;

-- Create separate policies for different operations
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);