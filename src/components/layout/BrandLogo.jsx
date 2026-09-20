import React from 'react'

export default function BrandLogo({ className = '', size = 'md' }) {
  const heights = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-16 md:h-20'
  }

  const logoHeight = heights[size] || heights.md

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <img
        src="/taqat-logo.png"
        alt="طاقات TAQAT"
        className={`${logoHeight} w-auto object-contain drop-shadow-sm`}
      />
      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 font-extrabold shrink-0">
        طاقات
      </span>
    </div>
  )
}

