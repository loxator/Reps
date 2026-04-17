import Link from 'next/link'
import { Users, Trophy, MapPin, ArrowRight, ClipboardList, Flag } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Carousel } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const heroSlides = [
  {
    src: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1400&h=800&fit=crop&q=80',
    alt: 'Athlete competing in a CrossFit event',
  },
  {
    src: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1400&h=800&fit=crop&q=80',
    alt: 'Runners at the start of a race',
  },
  {
    src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&h=800&fit=crop&q=80',
    alt: 'Athlete lifting weights at a competition',
  },
  {
    src: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400&h=800&fit=crop&q=80',
    alt: 'Group fitness class working out together',
  },
]

const stats = [
  { value: '500+', label: 'Registered athletes' },
  { value: '50+', label: 'Events hosted' },
  { value: '12', label: 'Regions covered' },
  { value: '98%', label: 'Athlete satisfaction' },
]

const athleteFeatures = [
  {
    icon: MapPin,
    title: 'Find events near you',
    description: 'Browse fitness competitions by region, sport, and skill level. New events added weekly.',
  },
  {
    icon: ClipboardList,
    title: 'Register in minutes',
    description: 'Select your division, fill in your details, and you\'re in. No paperwork, no waiting.',
  },
  {
    icon: Trophy,
    title: 'Track your progress',
    description: 'See all your past and upcoming events in one place. Review your divisions and history.',
  },
]

const organizerFeatures = [
  {
    icon: Flag,
    title: 'Create events fast',
    description: 'Set up your competition with custom divisions, workouts, and registration windows in minutes.',
  },
  {
    icon: Users,
    title: 'Manage registrations',
    description: 'See who\'s signed up, manage divisions, and communicate with athletes from one dashboard.',
  },
  {
    icon: ClipboardList,
    title: 'Run your competition',
    description: 'Built-in tools for check-in, heat management, and results — everything you need on event day.',
  },
]

const steps = [
  { step: '01', title: 'Create an account', description: 'Sign up as an athlete or event organizer in under a minute.' },
  { step: '02', title: 'Find or create an event', description: 'Browse upcoming competitions near you, or set up your own with custom divisions.' },
  { step: '03', title: 'Register and show up', description: 'Secure your spot, get confirmation, and focus on competing.' },
]

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative h-[90vh] min-h-[560px]">
          <Carousel
            slides={heroSlides}
            autoplayDelay={5000}
            className="absolute inset-0"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 pointer-events-none" />

          {/* Hero content */}
          <div className="relative z-raised h-full flex flex-col items-center justify-center text-center px-page-x">
            <h3 className="text-2xl font-bold text-white text-center mb-2">reps.</h3>
            <p className="text-sm font-medium text-white/70 uppercase tracking-widest mb-4">
              Fitness competitions, simplified
            </p>
            <h1 className="text-title md:text-display font-bold text-white max-w-3xl leading-tight">
              Your next competition starts here.
            </h1>
            <p className="mt-6 text-base text-white/80 max-w-xl leading-relaxed">
              reps. connects athletes and organizers across the region — making it easy to discover, register for, and run fitness events.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center pointer-events-auto">
              <Button asChild size="lg" className="bg-white text-foreground hover:bg-white/90 px-6">
                <Link href="/events">Browse events</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/50 hover:bg-white/10 px-6">
                <Link href="/register">Join in the fun! </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Stats bar ────────────────────────────────────────────────── */}
        <section className="border-b border-border bg-muted">
          <div className="mx-auto max-w-6xl px-page-x py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-4xl font-bold tracking-tight">{value}</p>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── For athletes ─────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-page-x py-section">
          <div className="grid md:grid-cols-[1fr_2fr] gap-12 md:gap-16 items-start">
            {/* Intro */}
            <div className="md:sticky md:top-24">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">For athletes</p>
              <h2 className="text-heading font-bold mb-4">Everything you need to compete</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                From local CrossFit boxes to regional running races — find competitions that match your fitness level and goals, then register in minutes.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-6">
                <Link href="/events">Browse events <ArrowRight className="size-3.5" /></Link>
              </Button>
            </div>
            {/* Cards */}
            <div className="flex flex-col gap-4">
              {athleteFeatures.map(({ icon: Icon, title, description }) => (
                <Card key={title} className="flex gap-5 items-start">
                  <div className="flex items-center justify-center size-12 rounded-xl bg-muted shrink-0">
                    <Icon className="size-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Divider image strip ───────────────────────────────────────── */}
        <div className="h-72 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1400&h=400&fit=crop&q=80"
            alt="Athletes competing at an outdoor fitness event"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* ── For organizers ───────────────────────────────────────────── */}
        <section className="bg-muted border-y border-border">
          <div className="mx-auto max-w-6xl px-page-x py-section">
            <div className="grid md:grid-cols-[2fr_1fr] gap-12 md:gap-16 items-start">
              {/* Cards */}
              <div className="flex flex-col gap-4 md:order-first">
                {organizerFeatures.map(({ icon: Icon, title, description }) => (
                  <Card key={title} variant="flat" className="flex gap-5 items-start">
                    <div className="flex items-center justify-center size-12 rounded-xl bg-muted shrink-0">
                      <Icon className="size-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                    </div>
                  </Card>
                ))}
              </div>
              {/* Intro */}
              <div className="md:sticky md:top-24">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">For organizers</p>
                <h2 className="text-heading font-bold mb-4">Run better events, faster</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Everything in one place — from registration and divisions to check-in and results. No spreadsheets, no third-party tools.
                </p>
                <Button asChild size="sm" className="mt-6">
                  <Link href="/register">Start for free <ArrowRight className="size-3.5" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-page-x py-section">
          <div className="mb-10 text-center">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">Getting started</p>
            <h2 className="text-heading font-bold">How it works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ step, title, description }) => (
              <Card key={step} className="flex flex-col gap-3">
                <p className="text-6xl font-black text-border leading-none">{step}</p>
                <h3 className="font-semibold text-base mt-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ── CTA banner ───────────────────────────────────────────────── */}
        <section className="bg-foreground text-background">
          <div className="mx-auto max-w-6xl px-page-x py-section flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-subhead font-bold">Ready to find your next competition?</h2>
              <p className="text-sm text-background/60 mt-1">Join hundreds of athletes competing across the region.</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90 px-6">
                <Link href="/events">Browse events</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-background hover:bg-white/10 px-6">
                <Link href="/register">Sign up free</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer className="border-t border-border">
          <div className="mx-auto max-w-6xl px-page-x py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">reps.</p>
            <nav className="flex gap-6">
              <Link href="/events" className="hover:text-foreground transition-colors">Events</Link>
              <Link href="/register" className="hover:text-foreground transition-colors">Sign up</Link>
              <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            </nav>
            <p>© {new Date().getFullYear()} reps. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </>
  )
}
