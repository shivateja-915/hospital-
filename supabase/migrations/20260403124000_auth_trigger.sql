-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Default to 'patient' if role is not provided
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    (COALESCE(NEW.raw_user_meta_data->>'role', 'patient'))::public.user_role
  );
  
  IF NEW.raw_user_meta_data->>'role' = 'doctor' THEN
    INSERT INTO public.doctors (user_id, specialization, experience_years, consultation_fee, license_number, bio)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'specialization',
      NULLIF(NEW.raw_user_meta_data->>'experience_years', '')::integer,
      NULLIF(NEW.raw_user_meta_data->>'consultation_fee', '')::integer,
      NEW.raw_user_meta_data->>'license_number',
      NEW.raw_user_meta_data->>'bio'
    );
  ELSE
    INSERT INTO public.patients (user_id, age, gender, blood_group, phone)
    VALUES (
      NEW.id,
      NULLIF(NEW.raw_user_meta_data->>'age', '')::integer,
      NEW.raw_user_meta_data->>'gender',
      NEW.raw_user_meta_data->>'blood_group',
      NEW.raw_user_meta_data->>'phone'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
