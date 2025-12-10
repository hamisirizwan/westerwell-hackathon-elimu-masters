import { cn } from '@/lib/utils'

export function SendFlowLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-8 w-auto', className)}
    >
      {/* Flow icon - stylized arrow/wave */}
      <path
        d="M4 20C4 20 8 12 14 12C20 12 20 20 26 20C30 20 32 16 32 16"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        className="text-primary"
      />
      <circle cx="6" cy="20" r="2.5" fill="currentColor" className="text-primary" />
      
      {/* SendFlow text */}
      <text
        x="40"
        y="22"
        fill="currentColor"
        className="text-foreground"
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '18px',
          fontWeight: 600,
          letterSpacing: '-0.02em',
        }}
      >
        <tspan>Send</tspan>
        <tspan className="text-primary" fill="currentColor">Flow</tspan>
      </text>
    </svg>
  )
}

export function SendFlowLogoText({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Flow icon */}
      <svg
        viewBox="0 0 36 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-auto"
      >
        <path
          d="M4 20C4 20 8 12 14 12C20 12 20 20 26 20C30 20 32 16 32 16"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          className="text-primary"
        />
        <circle cx="6" cy="20" r="2.5" fill="currentColor" className="text-primary" />
      </svg>
      
      {/* Text */}
      <span className="text-xl font-semibold tracking-tight">
        <span className="text-foreground">ELimu</span>
        <span className="text-primary">Masters</span>
      </span>
    </div>
  )
}

export function SendFlowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-8 w-8', className)}
    >
      <path
        d="M2 20C2 20 6 12 12 12C18 12 18 20 24 20C28 20 30 16 30 16"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        className="text-primary"
      />
      <circle cx="4" cy="20" r="2.5" fill="currentColor" className="text-primary" />
    </svg>
  )
}

