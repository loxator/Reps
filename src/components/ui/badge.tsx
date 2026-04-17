import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        open:       'bg-success-100 text-success-700',
        closed:     'bg-neutral-100 text-neutral-500',
        draft:      'bg-warning-100 text-warning-700',
        nearlyFull: 'bg-warning-100 text-warning-700',
        full:       'bg-danger-100 text-danger-700',
        default:    'bg-neutral-100 text-neutral-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
