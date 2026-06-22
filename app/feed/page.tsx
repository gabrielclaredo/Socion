"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Bookmark, User, Shield, MapPin, ChevronUp, ChevronDown } from "lucide-react"
import { BottomNav } from "@/components/layout/BottomNav"

interface FeedUser {
  id: string; name: string | null; image: string | null
  headline: string | null; location: string | null
  trustScore: number; availability: string | null
  offeredRoles: string[]; skills: { name: string; category: string }[]
}

export default function FeedPage() {
  const router = useRouter()
  const [users, setUsers] = useState<FeedUser[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [direction, setDirection] = useState<"up" | "down">("up")
  const [animating, setAnimating] = useState(false)
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)

  const loadMore = useCallback(async (cur?: string | null) => {
    const res = await fetch(cur ? `/api/feed?cursor=${cur}` : "/api/feed")
    const data = await res.json()
    setUsers((u) => [...u, ...data.users])
    setCursor(data.nextCursor)
    setLoading(false)
  }, [])

  useEffect(() => { loadMore() }, [loadMore])

  const current = users[currentIdx]
  const hasPrev = currentIdx > 0
  const hasNext = currentIdx < users.length - 1

  function goNext() {
    if (animating || !hasNext) return
    setDirection("up")
    setAnimating(true)
    setTimeout(() => { setCurrentIdx(i => i + 1); setAnimating(false) }, 320)
    if (currentIdx >= users.length - 3 && cursor) loadMore(cursor)
  }

  function goPrev() {
    if (animating || !hasPrev) return
    setDirection("down")
    setAnimating(true)
    setTimeout(() => { setCurrentIdx(i => i - 1); setAnimating(false) }, 320)
  }

  async function handleLike() {
    if (!current) return
    const isLiked = liked.has(current.id)
    if (isLiked) {
      setLiked(s => { const n = new Set(s); n.delete(current.id); return n })
      return
    }
    setLiked(s => new Set(s).add(current.id))
    await fetch("/api/likes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: current.id }),
    })
    setTimeout(goNext, 400)
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
    touchStartX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    const dy = touchStartY.current - e.changedTouches[0].clientY
    const dx = Math.abs(touchStartX.current - e.changedTouches[0].clientX)
    if (Math.abs(dy) > 60 && dx < 80) {
      if (dy > 0) goNext()
      else goPrev()
    }
  }

  if (loading) return (
    <div style={{ height: "100dvh", background: "#0A0D3A", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #5865F2", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
    </div>
  )

  if (!current) return (
    <div style={{ height: "100dvh", background: "#0A0D3A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "#fff" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#1E2353", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Heart size={32} color="#5865F2" />
      </div>
      <div style={{ fontWeight: 700, fontSize: 20 }}>Você viu tudo!</div>
      <div style={{ fontSize: 14, color: "#8B90A8" }}>Novos perfis em breve.</div>
      <BottomNav />
    </div>
  )

  const isLiked = liked.has(current.id)
  const trustColor = current.trustScore >= 80 ? "#35ED7E" : current.trustScore >= 60 ? "#5865F2" : "#FF5757"

  return (
    <div
      style={{ height: "100dvh", width: "100%", maxWidth: 428, margin: "0 auto", position: "relative", overflow: "hidden", background: "#0A0D3A" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ y: direction === "up" ? "100%" : "-100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: direction === "up" ? "-100%" : "100%", opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          style={{ position: "absolute", inset: 0 }}
        >
          {/* Background photo */}
          {current.image ? (
            <Image src={current.image} alt={current.name ?? ""} fill style={{ objectFit: "cover" }} draggable={false} priority />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #1E2353, #0A0D3A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontWeight: 900, fontSize: 120, color: "rgba(88,101,242,0.3)", fontFamily: "var(--font-space)" }}>
                {current.name?.[0] ?? "?"}
              </span>
            </div>
          )}

          {/* Top badges */}
          <div style={{ position: "absolute", top: 52, left: 0, right: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px" }}>
            {/* Trust score */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", borderRadius: 12, padding: "6px 10px" }}>
              <Shield size={14} color={trustColor} />
              <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>{current.trustScore}</span>
            </div>
            {/* Duration pill */}
            <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 6, padding: "4px 8px" }}>
              <span style={{ fontWeight: 700, fontSize: 12, color: "#fff" }}>60s</span>
            </div>
          </div>

          {/* Right side actions */}
          <div style={{ position: "absolute", right: 16, bottom: 140, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            {/* Like */}
            <motion.button
              whileTap={{ scale: 0.82 }}
              onClick={handleLike}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}
            >
              <motion.div
                animate={{ scale: isLiked ? [1, 1.3, 1] : 1 }}
                transition={{ duration: 0.25 }}
                style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: isLiked ? "rgba(255,87,87,0.2)" : "rgba(0,0,0,0.4)",
                  border: isLiked ? "1.5px solid rgba(255,87,87,0.6)" : "1.5px solid rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(8px)",
                }}>
                <Heart size={22} fill={isLiked ? "#FF5757" : "none"} color={isLiked ? "#FF5757" : "#fff"} />
              </motion.div>
            </motion.button>

            {/* Bookmark */}
            <motion.button
              whileTap={{ scale: 0.82 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "rgba(0,0,0,0.4)", border: "1.5px solid rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(8px)",
              }}>
                <Bookmark size={22} color="#fff" />
              </div>
            </motion.button>

            {/* Profile */}
            <motion.button
              whileTap={{ scale: 0.82 }}
              onClick={() => router.push(`/profile/${current.id}`)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "rgba(0,0,0,0.4)", border: "1.5px solid rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(8px)",
              }}>
                <User size={22} color="#fff" />
              </div>
            </motion.button>
          </div>

          {/* Bottom scrim */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 280,
            background: "linear-gradient(to top, rgba(10,13,58,0.98) 0%, rgba(10,13,58,0.7) 60%, transparent 100%)",
          }} />

          {/* Bottom info */}
          <div style={{ position: "absolute", bottom: 80, left: 16, right: 76 }}>
            <div style={{ fontFamily: "var(--font-space, system-ui)", fontWeight: 700, fontSize: 26, color: "#fff", lineHeight: 1.2, letterSpacing: "-0.3px" }}>
              {current.name}
            </div>
            {current.headline && (
              <div style={{ fontSize: 14, color: "#E2E8F0", marginTop: 4, fontWeight: 500 }}>{current.headline}</div>
            )}
            {current.location && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                <MapPin size={12} color="#8B90A8" />
                <span style={{ fontSize: 13, color: "#8B90A8" }}>{current.location}</span>
              </div>
            )}
            {/* Skill pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {current.offeredRoles.slice(0, 2).map(r => (
                <span key={r} style={{
                  padding: "3px 10px", fontSize: 11, fontWeight: 600,
                  background: "rgba(88,101,242,0.25)", color: "#a5b4fc",
                  borderRadius: 999, border: "1px solid rgba(88,101,242,0.4)",
                }}>{r}</span>
              ))}
              {current.skills.slice(0, 2).map(s => (
                <span key={s.name} style={{
                  padding: "3px 10px", fontSize: 11, fontWeight: 500,
                  background: "rgba(255,255,255,0.1)", color: "#E2E8F0",
                  borderRadius: 999, border: "1px solid rgba(255,255,255,0.15)",
                }}>{s.name}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav arrows (desktop hint) */}
      {hasPrev && (
        <button onClick={goPrev} style={{
          position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.4)", border: "none", borderRadius: "50%",
          width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "#fff",
        }}><ChevronUp size={18} /></button>
      )}
      {hasNext && (
        <button onClick={goNext} style={{
          position: "absolute", bottom: 80, left: 12,
          background: "rgba(0,0,0,0.4)", border: "none", borderRadius: "50%",
          width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "#fff",
        }}><ChevronDown size={18} /></button>
      )}

      {/* Progress dots */}
      <div style={{ position: "absolute", top: 56, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
        {users.slice(Math.max(0, currentIdx - 2), currentIdx + 3).map((u) => {
          const isActive = u.id === current.id
          return (
            <div key={u.id} style={{
              width: isActive ? 20 : 4, height: 4, borderRadius: 2,
              background: isActive ? "#5865F2" : "rgba(255,255,255,0.3)",
              transition: "all 0.2s",
            }} />
          )
        })}
      </div>

      <BottomNav />
    </div>
  )
}
