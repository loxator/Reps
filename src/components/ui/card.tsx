import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  'rounded-xl border border-border bg-card transition-all duration-200',
  {
    variants: {
      variant: {
        // Standard informational card — subtle lift on hover
        default: 'shadow-card hover:shadow-panel hover:-translate-y-px hover:border-neutral-300',
        // Flat — used inside already-tinted sections (muted bg)
        flat: 'bg-background shadow-card hover:shadow-panel hover:-translate-y-px hover:border-neutral-300',
        // Static — no hover effect (purely decorative or form surfaces)
        static: 'shadow-card',
      },
      padding: {
        default: 'p-card',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ className, variant, padding, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ variant, padding }), className)} {...props} />
  )
}
