/*
  # Create Demo Users and Profiles

  This migration creates demo user accounts in Supabase Auth and their corresponding profiles.

  1. Demo Users Created
     - admin@farm.zm (password: admin123) - Administrator role
     - manager@farm.zm (password: manager123) - Farm Manager role  
     - staff@farm.zm (password: staff123) - Farm Worker role
     - customer@farm.zm (password: customer123) - Customer role

  2. Security
     - Users are created in auth.users table
     - Corresponding profiles are created in public.profiles table
     - Email confirmation is disabled for demo accounts

  3. Important Notes
     - These are demo accounts for development/testing purposes
     - In production, users should register through proper signup flow
     - Passwords should be changed in production environment
*/

-- Create demo users in auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@farm.zm',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'manager@farm.zm',
    crypt('manager123', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'staff@farm.zm',
    crypt('staff123', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'customer@farm.zm',
    crypt('customer123', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );

-- Create corresponding profiles for each user
INSERT INTO public.profiles (id, username, role, full_name, email, phone)
SELECT 
  u.id,
  CASE 
    WHEN u.email = 'admin@farm.zm' THEN 'admin'
    WHEN u.email = 'manager@farm.zm' THEN 'manager'
    WHEN u.email = 'staff@farm.zm' THEN 'staff'
    WHEN u.email = 'customer@farm.zm' THEN 'customer'
  END as username,
  CASE 
    WHEN u.email = 'admin@farm.zm' THEN 'admin'::user_role
    WHEN u.email = 'manager@farm.zm' THEN 'manager'::user_role
    WHEN u.email = 'staff@farm.zm' THEN 'staff'::user_role
    WHEN u.email = 'customer@farm.zm' THEN 'customer'::user_role
  END as role,
  CASE 
    WHEN u.email = 'admin@farm.zm' THEN 'Farm Administrator'
    WHEN u.email = 'manager@farm.zm' THEN 'Farm Manager'
    WHEN u.email = 'staff@farm.zm' THEN 'Farm Worker'
    WHEN u.email = 'customer@farm.zm' THEN 'Demo Customer'
  END as full_name,
  u.email,
  CASE 
    WHEN u.email = 'admin@farm.zm' THEN '+260-97-1111111'
    WHEN u.email = 'manager@farm.zm' THEN '+260-97-2222222'
    WHEN u.email = 'staff@farm.zm' THEN '+260-97-3333333'
    WHEN u.email = 'customer@farm.zm' THEN '+260-97-4444444'
  END as phone
FROM auth.users u
WHERE u.email IN ('admin@farm.zm', 'manager@farm.zm', 'staff@farm.zm', 'customer@farm.zm')
ON CONFLICT (id) DO NOTHING;