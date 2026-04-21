-- Seed data for local development.
--
-- Prerequisites
-- ─────────────
-- 1. Create these four accounts through the app's /register page:
--
--      organizer@reps.dev   (role: organizer)  → Jordan Ahmed
--      alice@reps.dev       (role: athlete)    → Alice Thornton
--      bob@reps.dev         (role: athlete)    → Bob Mansour
--      carol@reps.dev       (role: athlete)    → Carol Ndiaye
--
-- 2. Find their UUIDs:
--      SELECT id, email FROM auth.users ORDER BY created_at;
--
-- 3. Replace the four placeholder UUIDs in the DECLARE block below.
--
-- 4. Run this script in the Supabase SQL editor.
--    It is idempotent — safe to run multiple times.

-- │      Table       │                               Rows                                │
--   ├──────────────────┼───────────────────────────────────────────────────────────────────┤                              
--   │ users            │ 1 organizer + 3 athletes                                          │                            
--   ├──────────────────┼───────────────────────────────────────────────────────────────────┤                              
--   │ athlete_profiles │ 1 per athlete (location, DOB, gender, emergency contact)          │                            
--   ├──────────────────┼───────────────────────────────────────────────────────────────────┤                              
--   │ events           │ 2 upcoming (open) + 1 past (shows as Closed in UI)                │
--   ├──────────────────┼───────────────────────────────────────────────────────────────────┤                              
--   │ categories       │ 3 for evt1 (Rx, Scaled, Teams of 3), 2 for evt2, 1 for evt3       │                            
--   ├──────────────────┼───────────────────────────────────────────────────────────────────┤                              
--   │ workouts         │ 3 per evt1 category, 2 per evt2 category, 2 for evt3              │                            
--   ├──────────────────┼───────────────────────────────────────────────────────────────────┤                              
--   │ registrations    │ Alice + Bob in evt1 Rx, Carol's team in evt1 Teams, all 3 in evt2 │                            
--   ├──────────────────┼───────────────────────────────────────────────────────────────────┤                              
--   │ team_members     │ 2 members on Carol's team (one invited, one accepted)             │                            
--   ├──────────────────┼───────────────────────────────────────────────────────────────────┤                              
--   │ heats            │ 2 heats × 3 workouts for evt1 Rx                                  │                            
--   ├──────────────────┼───────────────────────────────────────────────────────────────────┤                              
--   │ heat_assignments │ Alice → Heat 1 and Bob → Heat 2 for all three Rx workouts         │                            
--   └──────────────────┴───────────────────────────────────────────────────────────────────┘                              
                                                                                                                      
--   Event capacities are set to match the derived-from-categories logic: evt1.capacity = 0 (Teams is unlimited),          
--   evt2.capacity = 120 (60 + 60). All inserts use on conflict (id) do nothing so the script is safe to re-run.         

do $$
declare
  -- ── Replace with real auth.users UUIDs ───────────────────────────────────
  org_id  uuid := '00000000-0000-0000-0001-000000000001'; -- organizer@reps.dev
  ath1_id uuid := '00000000-0000-0000-0001-000000000002'; -- alice@reps.dev
  ath2_id uuid := '00000000-0000-0000-0001-000000000003'; -- bob@reps.dev
  ath3_id uuid := '00000000-0000-0000-0001-000000000004'; -- carol@reps.dev

  -- ── Events ───────────────────────────────────────────────────────────────
  evt1 uuid := '00000000-0000-0000-0002-000000000001'; -- Gulf Throwdown 2026    (upcoming, unlimited cap)
  evt2 uuid := '00000000-0000-0000-0002-000000000002'; -- Desert Strength Series (upcoming, capped)
  evt3 uuid := '00000000-0000-0000-0002-000000000003'; -- Winter Challenge 2025  (past)

  -- ── Categories ───────────────────────────────────────────────────────────
  cat1 uuid := '00000000-0000-0000-0003-000000000001'; -- evt1 · Rx
  cat2 uuid := '00000000-0000-0000-0003-000000000002'; -- evt1 · Scaled
  cat3 uuid := '00000000-0000-0000-0003-000000000003'; -- evt1 · Teams of 3
  cat4 uuid := '00000000-0000-0000-0003-000000000004'; -- evt2 · Open
  cat5 uuid := '00000000-0000-0000-0003-000000000005'; -- evt2 · Beginner
  cat6 uuid := '00000000-0000-0000-0003-000000000006'; -- evt3 · Rx

  -- ── Workouts ─────────────────────────────────────────────────────────────
  wkt1  uuid := '00000000-0000-0000-0004-000000000001'; -- evt1 Rx       · Grace
  wkt2  uuid := '00000000-0000-0000-0004-000000000002'; -- evt1 Rx       · Annie
  wkt3  uuid := '00000000-0000-0000-0004-000000000003'; -- evt1 Rx       · Fight Gone Bad
  wkt4  uuid := '00000000-0000-0000-0004-000000000004'; -- evt1 Scaled   · Grace (Scaled)
  wkt5  uuid := '00000000-0000-0000-0004-000000000005'; -- evt1 Scaled   · Annie (Scaled)
  wkt6  uuid := '00000000-0000-0000-0004-000000000006'; -- evt1 Scaled   · Fight Gone Bad (Scaled)
  wkt7  uuid := '00000000-0000-0000-0004-000000000007'; -- evt1 Teams    · Team Relay
  wkt8  uuid := '00000000-0000-0000-0004-000000000008'; -- evt1 Teams    · Team Chipper
  wkt9  uuid := '00000000-0000-0000-0004-000000000009'; -- evt2 Open     · Heavy Fran
  wkt10 uuid := '00000000-0000-0000-0004-000000000010'; -- evt2 Open     · Dumbbell Chipper
  wkt11 uuid := '00000000-0000-0000-0004-000000000011'; -- evt2 Beginner · Light Fran
  wkt12 uuid := '00000000-0000-0000-0004-000000000012'; -- evt2 Beginner · Dumbbell Chipper (Beginner)
  wkt13 uuid := '00000000-0000-0000-0004-000000000013'; -- evt3 Rx       · Open 25.1
  wkt14 uuid := '00000000-0000-0000-0004-000000000014'; -- evt3 Rx       · Open 25.2

  -- ── Registrations ────────────────────────────────────────────────────────
  reg1 uuid := '00000000-0000-0000-0005-000000000001'; -- Alice  → evt1 Rx
  reg2 uuid := '00000000-0000-0000-0005-000000000002'; -- Bob    → evt1 Rx
  reg3 uuid := '00000000-0000-0000-0005-000000000003'; -- Carol  → evt1 Teams  (team captain)
  reg4 uuid := '00000000-0000-0000-0005-000000000004'; -- Alice  → evt2 Open
  reg5 uuid := '00000000-0000-0000-0005-000000000005'; -- Bob    → evt2 Open
  reg6 uuid := '00000000-0000-0000-0005-000000000006'; -- Carol  → evt2 Beginner

  -- ── Heats ────────────────────────────────────────────────────────────────
  heat1 uuid := '00000000-0000-0000-0006-000000000001'; -- evt1 Rx Grace         · Heat 1
  heat2 uuid := '00000000-0000-0000-0006-000000000002'; -- evt1 Rx Grace         · Heat 2
  heat3 uuid := '00000000-0000-0000-0006-000000000003'; -- evt1 Rx Annie         · Heat 1
  heat4 uuid := '00000000-0000-0000-0006-000000000004'; -- evt1 Rx Annie         · Heat 2
  heat5 uuid := '00000000-0000-0000-0006-000000000005'; -- evt1 Rx Fight Gone Bad· Heat 1
  heat6 uuid := '00000000-0000-0000-0006-000000000006'; -- evt1 Rx Fight Gone Bad· Heat 2

  -- ── Team members ─────────────────────────────────────────────────────────
  tm1 uuid := '00000000-0000-0000-0007-000000000001'; -- reg3 · Sarah Johnson
  tm2 uuid := '00000000-0000-0000-0007-000000000002'; -- reg3 · Omar Hassan

  -- ── Heat assignments ─────────────────────────────────────────────────────
  ha1 uuid := '00000000-0000-0000-0008-000000000001'; -- Alice → Grace          Heat 1
  ha2 uuid := '00000000-0000-0000-0008-000000000002'; -- Bob   → Grace          Heat 2
  ha3 uuid := '00000000-0000-0000-0008-000000000003'; -- Alice → Annie          Heat 1
  ha4 uuid := '00000000-0000-0000-0008-000000000004'; -- Bob   → Annie          Heat 2
  ha5 uuid := '00000000-0000-0000-0008-000000000005'; -- Alice → Fight Gone Bad Heat 1
  ha6 uuid := '00000000-0000-0000-0008-000000000006'; -- Bob   → Fight Gone Bad Heat 2

begin

  -- ── Users ────────────────────────────────────────────────────────────────
  insert into public.users (id, email, name, role) values
    (org_id,  'organizer@reps.dev', 'Jordan Ahmed',   'organizer'),
    (ath1_id, 'alice@reps.dev',     'Alice Thornton', 'athlete'),
    (ath2_id, 'bob@reps.dev',       'Bob Mansour',    'athlete'),
    (ath3_id, 'carol@reps.dev',     'Carol Ndiaye',   'athlete')
  on conflict (id) do nothing;

  -- ── Athlete profiles ─────────────────────────────────────────────────────
  insert into public.athlete_profiles (user_id, date_of_birth, gender, phone, emergency_contact, location) values
    (ath1_id, '1994-03-12', 'female', '+971 50 111 2233', 'Mark Thornton +971 50 111 2234',  'Dubai'),
    (ath2_id, '1991-07-28', 'male',   '+971 50 222 3344', 'Layla Mansour +971 50 222 3345',  'Abu Dhabi'),
    (ath3_id, '1998-11-05', 'female', '+971 50 333 4455', 'James Ndiaye +971 50 333 4456',   'Sharjah')
  on conflict (user_id) do nothing;

  -- ── Events ───────────────────────────────────────────────────────────────
  -- capacity = 0 for evt1 because the Teams category is unlimited (capacity 0)
  -- capacity = 120 for evt2 = sum of Open (60) + Beginner (60)
  -- capacity = 80 for evt3 = Rx category capacity
  insert into public.events (id, organizer_id, name, location, date, description, status, capacity) values
    (evt1, org_id,
     'Gulf Throwdown 2026',
     'CrossFit DXB, Al Quoz, Dubai',
     '2026-06-14',
     'The region''s premier functional fitness competition. Three judged workouts across one day — Rx, Scaled, and Teams. Live leaderboard and spectator entry.',
     'open', 0),

    (evt2, org_id,
     'Desert Strength Series',
     'Warehouse Gym, Mussafah, Abu Dhabi',
     '2026-05-17',
     'A two-workout strength competition for all levels. Expect heavy barbells, a dumbbell chipper, and a brutal time cap. Open and Beginner divisions.',
     'open', 120),

    (evt3, org_id,
     'Winter Challenge 2025',
     'Alpha Fitness, JLT, Dubai',
     '2025-11-22',
     'Two-day event from November 2025 — now closed. Results and leaderboard archived.',
     'open', 80)
  on conflict (id) do nothing;

  -- ── Categories ───────────────────────────────────────────────────────────
  insert into public.categories (id, event_id, name, type, capacity, team_size, order_num) values
    -- Gulf Throwdown 2026
    (cat1, evt1, 'Rx',         'individual', 40, 1, 1),
    (cat2, evt1, 'Scaled',     'individual', 60, 1, 2),
    (cat3, evt1, 'Teams of 3', 'team',        0, 3, 3),
    -- Desert Strength Series
    (cat4, evt2, 'Open',       'individual', 60, 1, 1),
    (cat5, evt2, 'Beginner',   'individual', 60, 1, 2),
    -- Winter Challenge 2025
    (cat6, evt3, 'Rx',         'individual', 80, 1, 1)
  on conflict (id) do nothing;

  -- ── Workouts ─────────────────────────────────────────────────────────────
  insert into public.workouts (id, event_id, category_id, name, description, scoring_type, order_num) values
    -- Gulf Throwdown · Rx
    (wkt1, evt1, cat1,
     'Grace',
     'For load: 30 clean & jerks. M 60 kg / F 42.5 kg. Athletes have 10 minutes to complete all 30 reps — load is the score.',
     'load', 1),
    (wkt2, evt1, cat1,
     'Annie',
     'For time: 50-40-30-20-10 double-unders and sit-ups. Time cap: 10 minutes.',
     'time', 2),
    (wkt3, evt1, cat1,
     'Fight Gone Bad',
     '3 rounds for max reps: 1 min wall balls (14 / 9 kg to 10 ft), 1 min sumo deadlift high-pull (35 kg), 1 min box jumps (60 / 50 cm), 1 min push press (35 kg), 1 min row (calories). 1 min rest between rounds.',
     'reps', 3),

    -- Gulf Throwdown · Scaled
    (wkt4, evt1, cat2,
     'Grace (Scaled)',
     'For load: 30 clean & jerks. M 42.5 kg / F 30 kg. Athletes have 10 minutes to complete all 30 reps — load is the score.',
     'load', 1),
    (wkt5, evt1, cat2,
     'Annie (Scaled)',
     'For time: 50-40-30-20-10 single-unders and sit-ups. Time cap: 12 minutes.',
     'time', 2),
    (wkt6, evt1, cat2,
     'Fight Gone Bad (Scaled)',
     '3 rounds for max reps: 1 min wall balls (9 / 6 kg to 9 ft), 1 min sumo deadlift high-pull (25 kg), 1 min box step-ups (60 / 50 cm), 1 min push press (25 kg), 1 min row (calories). 1 min rest between rounds.',
     'reps', 3),

    -- Gulf Throwdown · Teams of 3
    (wkt7, evt1, cat3,
     'Team Relay',
     'AMRAP 18: As a team of 3, accumulate as many rounds as possible of — 15 synchronised wall balls (9 kg), 12 toes-to-bar (split as needed), 9 power snatches (50 / 35 kg, each athlete must complete 3). One athlete works on the barbell at a time.',
     'rounds', 1),
    (wkt8, evt1, cat3,
     'Team Chipper',
     'For time (cap 20 min): 100 double-unders each athlete, 75 shared box jumps (60 cm), 50 shared pull-ups, 25 synchronised thrusters (60 / 42.5 kg), 10 synchronised bar muscle-ups.',
     'time', 2),

    -- Desert Strength Series · Open
    (wkt9, evt2, cat4,
     'Heavy Fran',
     'For time: 21-15-9 thrusters (52.5 kg M / 35 kg F) and pull-ups. Time cap: 7 minutes.',
     'time', 1),
    (wkt10, evt2, cat4,
     'Dumbbell Chipper',
     'For max reps in 12 minutes: 40 alternating dumbbell snatches (22.5 kg M / 15 kg F), 30 box jumps (60 / 50 cm), 20 dumbbell clusters (22.5 / 15 kg), then max assault bike calories with remaining time.',
     'reps', 2),

    -- Desert Strength Series · Beginner
    (wkt11, evt2, cat5,
     'Light Fran',
     'For time: 21-15-9 thrusters (35 kg M / 22.5 kg F) and ring rows. Time cap: 10 minutes.',
     'time', 1),
    (wkt12, evt2, cat5,
     'Dumbbell Chipper (Beginner)',
     'For max reps in 12 minutes: 40 alternating dumbbell snatches (15 kg M / 10 kg F), 30 box step-ups (60 / 50 cm), 20 dumbbell hang power cleans (15 / 10 kg), then max row calories with remaining time.',
     'reps', 2),

    -- Winter Challenge 2025 · Rx  (past event — for display only)
    (wkt13, evt3, cat6,
     'Open 25.1',
     'AMRAP 15: 3 pull-ups, 3 thrusters (43 / 29 kg) — adding 3 reps to each movement every round.',
     'reps', 1),
    (wkt14, evt3, cat6,
     'Open 25.2',
     'For time (cap 20 min): 4 rounds of 10 toes-to-bar and 10 dumbbell hang clean & jerks (22.5 / 15 kg each), then 10 rounds of 10 bar-facing burpees and 10 squat snatches (43 / 29 kg).',
     'time', 2)
  on conflict (id) do nothing;

  -- ── Registrations ────────────────────────────────────────────────────────
  insert into public.registrations
    (id, athlete_id, event_id, category_id, division, is_team, team_name, status, checked_in)
  values
    (reg1, ath1_id, evt1, cat1, 'Rx',       false, null,          'confirmed', false),
    (reg2, ath2_id, evt1, cat1, 'Rx',       false, null,          'confirmed', false),
    (reg3, ath3_id, evt1, cat3, 'Teams',    true,  'Desert Dogs', 'confirmed', false),
    (reg4, ath1_id, evt2, cat4, 'Open',     false, null,          'confirmed', false),
    (reg5, ath2_id, evt2, cat4, 'Open',     false, null,          'confirmed', false),
    (reg6, ath3_id, evt2, cat5, 'Beginner', false, null,          'confirmed', false)
  on conflict (id) do nothing;

  -- ── Team members (Carol's team for evt1 Teams) ───────────────────────────
  insert into public.team_members (id, registration_id, name, email, user_id, status) values
    (tm1, reg3, 'Sarah Johnson', 'sarah.johnson@example.com', null, 'invited'),
    (tm2, reg3, 'Omar Hassan',   'omar.hassan@example.com',   null, 'accepted')
  on conflict (id) do nothing;

  -- ── Heats (evt1 · Rx — all three workouts) ───────────────────────────────
  -- Start times are UTC; UAE is UTC+4, so 04:00 UTC = 08:00 local
  insert into public.heats (id, workout_id, name, start_time, capacity, order_num) values
    (heat1, wkt1, 'Heat 1', '2026-06-14 04:00:00+00', 10, 1),
    (heat2, wkt1, 'Heat 2', '2026-06-14 04:20:00+00', 10, 2),
    (heat3, wkt2, 'Heat 1', '2026-06-14 07:00:00+00', 10, 1),
    (heat4, wkt2, 'Heat 2', '2026-06-14 07:20:00+00', 10, 2),
    (heat5, wkt3, 'Heat 1', '2026-06-14 10:00:00+00', 10, 1),
    (heat6, wkt3, 'Heat 2', '2026-06-14 10:20:00+00', 10, 2)
  on conflict (id) do nothing;

  -- ── Heat assignments ─────────────────────────────────────────────────────
  insert into public.heat_assignments (id, heat_id, registration_id) values
    (ha1, heat1, reg1), -- Alice → Grace          · Heat 1
    (ha2, heat2, reg2), -- Bob   → Grace          · Heat 2
    (ha3, heat3, reg1), -- Alice → Annie          · Heat 1
    (ha4, heat4, reg2), -- Bob   → Annie          · Heat 2
    (ha5, heat5, reg1), -- Alice → Fight Gone Bad · Heat 1
    (ha6, heat6, reg2)  -- Bob   → Fight Gone Bad · Heat 2
  on conflict (id) do nothing;

end $$;
