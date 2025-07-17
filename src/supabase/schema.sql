-- Create a table for public user profiles
create table profiles (
  id uuid not null references auth.users on delete cascade,
  first_name text,
  last_name text,
  date_of_birth date,
  -- The phone number from the sign-up form
  phone_number text,
  -- A timestamp for when the profile was last updated
  updated_at timestamp with time zone,

  primary key (id)
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security
alter table profiles
  enable row level security;

-- This trigger automatically creates a profile entry when a new user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, date_of_birth, phone_number, updated_at)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    (new.raw_user_meta_data->>'date_of_birth')::date,
    new.raw_user_meta_data->>'phone_number',
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Allow users to view their own profile
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

-- Allow users to insert their own profile
create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);
