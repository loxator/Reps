'use client'

import { Search, CheckCircle2, Circle } from 'lucide-react'
import { useRegistrationList, type RegistrationRow } from './use-registration-list'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function formatTime(s: string | null) {
  if (!s) return null
  return new Date(s).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

type Category = { id: string; name: string }

export function RegistrationList({
  registrations,
  categories,
}: {
  registrations: RegistrationRow[]
  categories:    Category[]
}) {
  const {
    filtered,
    filterCategory, setFilterCategory,
    search, setSearch,
    toggleCheckedIn, toggling,
  } = useRegistrationList(registrations)

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Category filter tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filterCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All ({registrations.length})
          </button>
          {categories.map((c) => {
            const count = registrations.filter((r) => r.category?.id === c.id).length
            return (
              <button
                key={c.id}
                onClick={() => setFilterCategory(c.id)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  filterCategory === c.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {c.name} ({count})
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search athlete…"
            className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary w-48"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-dashed border-border">
          <p className="text-sm text-muted-foreground">No registrations found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                <th className="text-left px-4 py-3">Athlete</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Team</th>
                <th className="text-left px-4 py-3">Heats</th>
                <th className="text-left px-4 py-3">Registered</th>
                <th className="text-center px-4 py-3">Checked in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((reg) => (
                <tr key={reg.id} className="bg-card hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{reg.athlete?.name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{reg.athlete?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{reg.category?.name ?? reg.division}</td>
                  <td className="px-4 py-3 text-muted-foreground">{reg.team_name ?? '—'}</td>
                  <td className="px-4 py-3">
                    {reg.heat_assignments.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        {reg.heat_assignments.map((ha, i) => (
                          <span key={i} className="text-xs">
                            {ha.heats?.workouts?.name} · {ha.heats?.name}
                            {ha.heats?.start_time && (
                              <span className="text-muted-foreground"> · {formatTime(ha.heats.start_time)}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(reg.registered_at)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleCheckedIn(reg.id, reg.checked_in)}
                      disabled={toggling === reg.id}
                      className="mx-auto flex items-center justify-center size-7 rounded-full transition-colors hover:bg-muted disabled:opacity-50"
                    >
                      {reg.checked_in
                        ? <CheckCircle2 className="size-5 text-success-600" />
                        : <Circle className="size-5 text-muted-foreground" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
