-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  first_name text,
  last_name text,
  dob date,
  phone_number text,

  constraint "first_name_length" check (char_length(first_name) >= 2),
  constraint "last_name_length" check (char_length(last_name) >= 2)
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security
alter table profiles
  enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up.
-- See https://supabase.com/docs/guides/auth/managing-user-data#using-triggers
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, dob, phone_number)
  values (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', (new.raw_user_meta_data->>'dob')::date, new.raw_user_meta_data->>'phone_number');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
