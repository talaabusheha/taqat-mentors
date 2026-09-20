import React from 'react'

export default function BrandLogo({ className = '', size = 'md' }) {
  const heights = {
    sm: 'h-6 md:h-7',
    md: 'h-9 md:h-11',
    lg: 'h-14 md:h-16'
  }

  const logoHeight = heights[size] || heights.md

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <div className="bg-white/95 px-3.5 py-2 rounded-2xl shadow-sm border border-slate-200/80 inline-flex items-center justify-center">
        <img
          src="/taqat-logo.png"
          alt="TAQAT"
          className={`${logoHeight} w-auto object-contain block`}
        />
      </div>
    </div>
  )
}

