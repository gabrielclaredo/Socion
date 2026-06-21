interface TrustBadgeProps {
  score: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export function TrustBadge({ score, size = "md", className = "" }: TrustBadgeProps) {
  const dim = size === "sm" ? "w-10 h-10" : size === "lg" ? "w-20 h-20" : "w-14 h-14"
  const color = score >= 80 ? "#22C55E" : score >= 60 ? "#7B61FF" : "#F59E0B"
  const fs = size === "sm" ? 11 : size === "lg" ? 18 : 14

  return (
    <div
      className={`rounded-full flex flex-col items-center justify-center border-2 ${dim} ${className}`}
      style={{ borderColor: color }}
    >
      <span className="font-bold leading-none" style={{ color, fontSize: fs }}>{score}</span>
      <span className="text-white/50 leading-none" style={{ fontSize: 8 }}>Trust</span>
    </div>
  )
}
