'use client'

import { useState, useRef, useEffect } from 'react'
import type { RegSummary } from './use-heat-manager'

export function useHeatColumn(unassigned: RegSummary[]) {
  const [editingTime, setEditingTime] = useState(false)
  const [showPopover, setShowPopover] = useState(false)
  const [search,      setSearch]      = useState('')

  const popoverRef = useRef<HTMLDivElement>(null)
  const searchRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!showPopover) return
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showPopover])

  useEffect(() => {
    if (showPopover) searchRef.current?.focus()
  }, [showPopover])

  const filteredUnassigned = unassigned.filter((r) =>
    [r.athleteName, r.teamName]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  function formatTime(ts: string | null) {
    if (!ts) return null
    return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  function toLocalInput(ts: string | null) {
    if (!ts) return ''
    const d   = new Date(ts)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  function closePopover() {
    setShowPopover(false)
    setSearch('')
  }

  return {
    editingTime, setEditingTime,
    showPopover, setShowPopover,
    search, setSearch,
    popoverRef, searchRef,
    filteredUnassigned,
    formatTime,
    toLocalInput,
    closePopover,
  }
}
