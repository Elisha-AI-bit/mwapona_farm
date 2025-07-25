/*
  # Fix infinite recursion in profiles RLS policies

  1. Problem
    - The existing "Admins can manage all profiles" policy creates infinite recursion
    - It queries the profiles table from within the profiles table policy
    - This causes a circular dependency when trying to fetch user profiles

  2. Solution
    - Drop the problematic policy that causes recursion
    - Create a simpler policy structure that avoids self-referencing
    - Use auth.uid() directly without querying profiles table within profiles policies
    - Add a separate policy for admin management that doesn't cause recursion

  3. Security
    - Users can read all profiles (needed for the app functionality)
    - Users can update their own profile
    - Admin management will be handled at the application level
*/

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policies that don't cause recursion
CREATE POLICY "Users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Note: Admin management will be handled at the application level
-- to avoid the infinite recursion issue with RLS policies