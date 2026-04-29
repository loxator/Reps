'use client'

import { useEffect, useRef } from 'react'

const COLORS = ['#22c55e', '#16a34a', '#4ade80', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899']

function injectKeyframes() {
  if (document.getElementById('confetti-style')) return
  const style = document.createElement('style')
  style.id = 'confetti-style'
  style.textContent = `
    @keyframes confetti-fall {
      0%   { opacity: 1; transform: translateY(0)            rotate(0deg); }
      100% { opacity: 0; transform: translateY(var(--end-y)) rotate(var(--rotate)); }
    }
  `
  document.head.appendChild(style)
}

export function useSuccessScreen() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    injectKeyframes()

    const pieces: HTMLDivElement[] = []

    for (let i = 0; i < 48; i++) {
      const el       = document.createElement('div')
      const size     = Math.random() * 6 + 4
      const color    = COLORS[Math.floor(Math.random() * COLORS.length)]
      const x        = Math.random() * 100
      const delay    = Math.random() * 400
      const duration = Math.random() * 800 + 1200
      const endY     = Math.random() * 80 + 40
      const rotate   = Math.random() * 720 - 360

      el.style.cssText = `
        position:fixed; top:20px; left:${x}%;
        width:${size}px; height:${size}px;
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        background-color:${color}; opacity:0;
        pointer-events:none; z-index:9999;
        animation:confetti-fall ${duration}ms ${delay}ms cubic-bezier(0.25,0.46,0.45,0.94) forwards;
        --end-y:${endY}vh; --rotate:${rotate}deg;
      `

      document.body.appendChild(el)
      pieces.push(el)
    }

    const timeout = setTimeout(() => pieces.forEach((el) => el.remove()), 2500)

    return () => {
      clearTimeout(timeout)
      pieces.forEach((el) => el.remove())
    }
  }, [])

  return { containerRef }
}
