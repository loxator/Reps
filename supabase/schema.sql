-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.athlete_profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE,
  date_of_birth date,
  gender text,
  phone text,
  emergency_contact text,
  location text,
  CONSTRAINT athlete_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT athlete_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  name text NOT NULL,
  capacity integer NOT NULL DEFAULT 0,
  order_num integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  type text NOT NULL DEFAULT 'individual'::text CHECK (type = ANY (ARRAY['individual'::text, 'team'::text])),
  team_size integer NOT NULL DEFAULT 1,
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  organizer_id uuid,
  name text NOT NULL,
  location text NOT NULL,
  date date NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'open'::text, 'closed'::text])),
  created_at timestamp with time zone DEFAULT now(),
  capacity integer NOT NULL DEFAULT 0,
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.users(id)
);
CREATE TABLE public.heat_assignments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  heat_id uuid NOT NULL,
  registration_id uuid NOT NULL,
  assigned_at timestamp with time zone DEFAULT now(),
  CONSTRAINT heat_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT heat_assignments_heat_id_fkey FOREIGN KEY (heat_id) REFERENCES public.heats(id),
  CONSTRAINT heat_assignments_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.registrations(id)
);
CREATE TABLE public.heats (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  workout_id uuid NOT NULL,
  name text NOT NULL,
  start_time timestamp with time zone,
  capacity integer NOT NULL DEFAULT 0,
  order_num integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT heats_pkey PRIMARY KEY (id),
  CONSTRAINT heats_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES public.workouts(id)
);
CREATE TABLE public.registrations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  athlete_id uuid,
  event_id uuid,
  division text NOT NULL,
  status text NOT NULL DEFAULT 'confirmed'::text CHECK (status = ANY (ARRAY['confirmed'::text, 'waitlist'::text])),
  registered_at timestamp with time zone DEFAULT now(),
  category_id uuid,
  team_name text,
  is_team boolean NOT NULL DEFAULT false,
  checked_in boolean NOT NULL DEFAULT false,
  checked_in_at timestamp with time zone,
  CONSTRAINT registrations_pkey PRIMARY KEY (id),
  CONSTRAINT registrations_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES public.users(id),
  CONSTRAINT registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT registrations_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  registration_id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  invited_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  status text NOT NULL DEFAULT 'invited'::text CHECK (status = ANY (ARRAY['invited'::text, 'accepted'::text, 'declined'::text])),
  CONSTRAINT team_members_pkey PRIMARY KEY (id),
  CONSTRAINT team_members_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.registrations(id),
  CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['organizer'::text, 'athlete'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.workouts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid,
  order_num integer NOT NULL DEFAULT 1,
  name text NOT NULL,
  description text NOT NULL,
  scoring_type text NOT NULL CHECK (scoring_type = ANY (ARRAY['time'::text, 'reps'::text, 'load'::text, 'rounds'::text])),
  category_id uuid,
  CONSTRAINT workouts_pkey PRIMARY KEY (id),
  CONSTRAINT workouts_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT workouts_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.workout_scores (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  registration_id uuid NOT NULL,
  workout_id uuid NOT NULL,
  score_value numeric NOT NULL,
  notes text,
  recorded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT workout_scores_pkey PRIMARY KEY (id),
  CONSTRAINT workout_scores_registration_fkey FOREIGN KEY (registration_id) REFERENCES public.registrations(id) ON DELETE CASCADE,
  CONSTRAINT workout_scores_workout_fkey FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE,
  CONSTRAINT workout_scores_unique UNIQUE (registration_id, workout_id)
);