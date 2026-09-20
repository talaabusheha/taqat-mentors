import React from 'react'

export default function BrandLogo({ className = '', size = 'md' }) {
  const isLarge = size === 'lg'
  const textSize = isLarge ? 'text-2xl md:text-3xl font-black tracking-widest' : 'text-xl font-black tracking-wider'
  const iconSize = isLarge ? 'w-10 h-10' : 'w-7 h-7'

  return (
    <div className={`inline-flex items-center gap-2 font-bold select-none ${className}`}>
      {/* Official TAQAT Sun/Gear Icon SVG */}
      <div className="relative flex items-center justify-center">
        <svg
          className={`${iconSize}`}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sun Blocks (TAQAT Sun Amber #f8a11d) */}
          <rect x="42" y="5" width="16" height="12" rx="3" fill="#f8a11d" />
          <rect x="73" y="16" width="16" height="12" rx="3" fill="#f8a11d" transform="rotate(45 73 16)" />
          <rect x="83" y="42" width="16" height="12" rx="3" fill="#f8a11d" transform="rotate(90 83 42)" />
          <rect x="15" y="18" width="16" height="12" rx="3" fill="#f8a11d" transform="rotate(-45 15 18)" />

          {/* Lower Arc & Inner Dot (TAQAT Blue #0072bc) */}
          <path
            d="M 22,55 A 28,28 0 1,0 78,55 L 66,55 A 16,16 0 1,1 34,55 Z"
            fill="#0072bc"
          />
          <path d="M 60,65 L 75,78 L 65,82 Z" fill="#0072bc" />
          <circle cx="50" cy="45" r="8" fill="#0072bc" />
        </svg>
      </div>

      {/* Brand Text: TAQAT */}
      <div className={`flex items-center ${textSize} uppercase font-sans dir-ltr text-[#0072bc]`}>
        <span>T</span>
        <span>A</span>
        <div className="relative inline-flex items-center justify-center mx-0.5">
          <span>Q</span>
          <span className="absolute -top-1 w-2 h-2 rounded-full bg-[#f8a11d]" />
        </div>
        <span>A</span>
        <span>T</span>
      </div>

      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 font-extrabold mr-1">
        طاقات
      </span>
    </div>
  )
}
