import { cn } from "@/lib/utils"

const beams = [
  "M32 218C126 120 196 112 292 154C398 200 480 134 548 46",
  "M18 84C102 116 174 78 244 38C336 -16 420 24 506 102",
  "M82 262C168 232 214 286 304 252C406 214 438 274 544 238",
]

const ticks = [
  { x: 54, y: 58, label: "021" },
  { x: 148, y: 196, label: "144" },
  { x: 278, y: 86, label: "377" },
  { x: 406, y: 224, label: "610" },
  { x: 512, y: 126, label: "987" },
]

export function SignalField({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 576 320"
      className={cn(
        "signal-field pointer-events-none absolute -right-28 -top-20 h-[22rem] w-[40rem] max-w-none sm:-right-12 lg:right-[calc(50%-42rem)]",
        className
      )}
    >
      <defs>
        <linearGradient id="signal-beam" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="48%" stopColor="currentColor" stopOpacity="0.58" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="signal-glow" cx="50%" cy="38%" r="58%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <pattern
          id="signal-grid"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M32 0H0V32"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.12"
          />
        </pattern>
      </defs>
      <rect width="576" height="320" fill="url(#signal-glow)" />
      <rect
        x="38"
        y="20"
        width="498"
        height="264"
        rx="16"
        fill="url(#signal-grid)"
        opacity="0.7"
      />
      <g className="signal-field__pulse" fill="none">
        {beams.map((beam, index) => (
          <path
            key={beam}
            d={beam}
            stroke="url(#signal-beam)"
            strokeWidth={index === 0 ? 1.4 : 1}
            strokeDasharray={index === 1 ? "5 12" : "2 10"}
          />
        ))}
      </g>
      <g fontFamily="var(--font-mono)" fontSize="10" fontWeight="600">
        {ticks.map((tick) => (
          <g key={tick.label}>
            <circle
              cx={tick.x}
              cy={tick.y}
              r="3.5"
              fill="currentColor"
              opacity="0.68"
            />
            <text
              x={tick.x + 10}
              y={tick.y + 3}
              fill="currentColor"
              opacity="0.58"
            >
              {tick.label}
            </text>
          </g>
        ))}
      </g>
      <path
        d="M68 286H508"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeDasharray="1 9"
      />
    </svg>
  )
}
