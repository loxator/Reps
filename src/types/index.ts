export type UserRole = 'organizer' | 'athlete'

export type EventStatus = 'draft' | 'open' | 'closed'

export type ScoringType = 'time' | 'reps' | 'load' | 'rounds'

export interface User {
  id: string
  email: string
  role: UserRole
  name: string
  created_at: string
}

export interface AthleteProfile {
  id: string
  user_id: string
  date_of_birth: string | null
  gender: string | null
  phone: string | null
  emergency_contact: string | null
  location: string | null
}

export interface Event {
  id: string
  organizer_id: string
  name: string
  location: string
  date: string
  description: string | null
  status: EventStatus
  /** 0 = unlimited */
  capacity: number
  created_at: string
  categories?: Category[]
  /** Supabase aggregate: .select('*, registrations(count)') */
  registrations?: { count: number }[]
}

export interface Category {
  id: string
  event_id: string
  name: string
  type: 'individual' | 'team'
  /** 0 = unlimited */
  capacity: number
  /** for team categories: total members per team including the registrant */
  team_size: number
  order_num: number
  created_at: string
  workouts?: Workout[]
}

export interface TeamMember {
  id: string
  registration_id: string
  name: string
  email: string
  user_id: string | null
  status: 'invited' | 'accepted' | 'declined'
}

export interface Workout {
  id: string
  category_id: string
  order_num: number
  name: string
  description: string
  scoring_type: ScoringType
}

export interface Registration {
  id: string
  athlete_id: string
  event_id: string
  category_id: string | null
  division: string
  team_name: string | null
  is_team: boolean
  registered_at: string
  status: 'confirmed' | 'waitlist'
  checked_in: boolean
  checked_in_at: string | null
  athlete?: User
  heat_assignments?: HeatAssignment[]
}

export interface Heat {
  id: string
  workout_id: string
  name: string
  start_time: string | null
  capacity: number
  order_num: number
  created_at: string
  heat_assignments?: HeatAssignment[]
}

export interface HeatAssignment {
  id: string
  heat_id: string
  registration_id: string
  assigned_at: string
  heats?: Heat & { workouts?: Pick<Workout, 'id' | 'name' | 'order_num'> }
}

export interface WorkoutScore {
  id: string
  registration_id: string
  workout_id: string
  score_value: number
  notes: string | null
  recorded_at: string
}
