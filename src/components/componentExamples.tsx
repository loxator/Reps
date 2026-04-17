import { Button } from '@/components/ui/button'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold border-b pb-2">{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

function Stub({ name }: { name: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
      <code>{name}</code> — not yet implemented
    </div>
  )
}

export default function ComponentExamples() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 flex flex-col gap-16">
      <div>
        <h1 className="text-3xl font-bold">Component Library</h1>
        <p className="mt-2 text-muted-foreground">All available UI components and their variants.</p>
      </div>

      {/* ── Button ── */}
      <Section title="Button">
        <Row label="Variants">
          <Button variant="default">Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </Row>

        <Row label="Selector (toggle)">
          <Button variant="selector" aria-pressed={false}>Inactive</Button>
          <Button variant="selector" aria-pressed={true}>Active</Button>
        </Row>

        <Row label="Sizes">
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </Row>

        <Row label="Icon sizes">
          <Button size="icon-xs" aria-label="Icon XS">
            <span>+</span>
          </Button>
          <Button size="icon-sm" aria-label="Icon SM">
            <span>+</span>
          </Button>
          <Button size="icon" aria-label="Icon">
            <span>+</span>
          </Button>
          <Button size="icon-lg" aria-label="Icon LG">
            <span>+</span>
          </Button>
        </Row>

        <Row label="States">
          <Button disabled>Disabled</Button>
          <Button disabled variant="outline">Disabled outline</Button>
          <Button aria-invalid="true">Invalid</Button>
        </Row>

        <Row label="Full width">
          <Button className="w-full">Full width</Button>
        </Row>
      </Section>

      {/* ── Badge ── */}
      <Section title="Badge">
        <Stub name="badge.tsx" />
      </Section>

      {/* ── Card ── */}
      <Section title="Card">
        <Stub name="card.tsx" />
      </Section>

      {/* ── Input ── */}
      <Section title="Input">
        <Stub name="input.tsx" />
      </Section>
    </div>
  )
}
