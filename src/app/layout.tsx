import type { Metadata } from 'next'
import { Figtree } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Reps — Fitness Competitions',
  description: 'Sign up for fitness competitions in your region',
  openGraph: {
    title: 'Reps — Fitness Competitions',
    description: 'Discover, register for, and run fitness competitions in your region.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("font-sans antialiased", figtree.variable)}>
      <body>{children}</body>
    </html>
  )
}
