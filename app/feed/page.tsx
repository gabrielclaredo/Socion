"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { Heart, X, Star, SlidersHorizontal } from "lucide-react"
import { BottomNav } from "@/components/layout/BottomNav"

// ── Design tokens (DESIGN.md) ─────────────────────────────────
const T = {
  primary:    "#000000",
  onPrimary:  "#ffffff",
  canvas:     "#ffffff",
  ink:        "#000000",
  surfaceSoft:"#f7f7f5",
  hairline:   "#e6e6e6",
  hairlineSoft:"#f1f1f1",
  lilac:      "#c5b0f4",
  lime:       "#dceeb1",
  coral:      "#f3c9b6",
  navy:       "#1f1d3d",
  magenta:    "#ff3d8b",
  success:    "#1ea64a",
  // rounded
  rMd:  "8px",
  rLg:  "24px",
  rXl:  "32px",
  rPill:"50px",
  rFull:"9999px",
}

interface FeedUser {
  id: string; name: string | null; image: string | null
  headline: string | null; location: string | null
  trustScore: number; availability: string | null
  offeredRoles: string[]; skills: { name: string; category: string }[]
}

interface MatchModal { show: boolean; matchId?: string; userName?: string }

function SwipeCard({
  user, onLike, onPass, onView, isTop,
}: {
  user: FeedUser; onLike: () => void; onPass: () => void; onView: () => void; isTop: boolean
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-18, 18])
  const likeOpacity = useTransform(x, [40, 130], [0, 1])
  const passOpacity = useTransform(x, [-130, -40], [1, 0])

  // Distinguish tap from drag
  const dragDeltaRef = useRef(0)

  function handleDragStart() { dragDeltaRef.current = 0 }
  function handleDrag(_: unknown, info: { delta: { x: number } }) {
    dragDeltaRef.current += Math.abs(info.delta.x)
  }
  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x > 120) onLike()
    else if (info.offset.x < -120) onPass()
  }
  function handleClick() {
    if (dragDeltaRef.current < 8) onView()
  }

  const trustColor = user.trustScore >= 80 ? T.success : user.trustScore >= 60 ? T.lilac : T.coral

  return (
    <motion.div
      style={{ x, rotate, position: "absolute", inset: 0 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      animate={{ scale: isTop ? 1 : 0.965, y: isTop ? 0 : 10 }}
      exit={{ x: x.get() > 0 ? 500 : -500, opacity: 0, transition: { duration: 0.26 } }}
      className="touch-none"
      onClick={isTop ? handleClick : undefined}
    >
      {/* Swipe stamps */}
      {isTop && (
        <>
          <motion.div style={{ opacity: likeOpacity }}
            className="absolute top-5 left-4 z-10 pointer-events-none select-none">
            <span style={{
              display: "block", fontWeight: 900, fontSize: 18, letterSpacing: "0.12em",
              textTransform: "uppercase", color: T.success, border: `3px solid ${T.success}`,
              borderRadius: T.rMd, padding: "4px 10px", transform: "rotate(-16deg)",
            }}>Curtir</span>
          </motion.div>
          <motion.div style={{ opacity: passOpacity }}
            className="absolute top-5 right-4 z-10 pointer-events-none select-none">
            <span style={{
              display: "block", fontWeight: 900, fontSize: 18, letterSpacing: "0.12em",
              textTransform: "uppercase", color: T.magenta, border: `3px solid ${T.magenta}`,
              borderRadius: T.rMd, padding: "4px 10px", transform: "rotate(16deg)",
            }}>Passar</span>
          </motion.div>
        </>
      )}

      {/* Card — pricing-card style from DESIGN.md */}
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        background: T.canvas, borderRadius: T.rLg,
        border: `1px solid ${T.hairline}`,
        overflow: "hidden",
        userSelect: "none",
      }}>
        {/* Photo area */}
        <div style={{ position: "relative", flex: 1, background: T.surfaceSoft }}>
          {user.image ? (
            <Image src={user.image} alt={user.name ?? ""} fill className="object-cover" draggable={false} style={{ pointerEvents: "none" }} />
          ) : (
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center",
              justifyContent: "center", background: T.lilac,
            }}>
              <span style={{ fontWeight: 900, fontSize: 72, color: T.navy, lineHeight: 1 }}>
                {user.name?.[0] ?? "?"}
              </span>
            </div>
          )}

          {/* Trust badge — top-right */}
          <div style={{
            position: "absolute", top: 12, right: 12,
            width: 44, height: 44, borderRadius: T.rFull,
            background: T.canvas, border: `2px solid ${trustColor}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: T.ink, lineHeight: 1 }}>{user.trustScore}</span>
            <span style={{ fontSize: 8, color: "rgba(0,0,0,0.4)", letterSpacing: "0.05em", textTransform: "uppercase" }}>trust</span>
          </div>
        </div>

        {/* Info — pricing-card padding: 24px */}
        <div style={{ padding: 20, background: T.canvas, flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: T.ink, letterSpacing: "-0.3px", lineHeight: 1.25 }}>
            {user.name}
          </div>
          {user.headline && (
            <div style={{ fontSize: 14, color: "rgba(0,0,0,0.5)", marginTop: 2, lineHeight: 1.4 }}>
              {user.headline}
            </div>
          )}
          {user.location && (
            <div style={{ fontSize: 12, color: "rgba(0,0,0,0.35)", marginTop: 2 }}>
              📍 {user.location}
            </div>
          )}

          {/* Pills — rounded.pill */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
            {user.offeredRoles.slice(0, 2).map((r) => (
              <span key={r} style={{
                padding: "4px 12px", fontSize: 12, fontWeight: 500,
                background: T.lilac, color: T.navy,
                borderRadius: T.rPill,
              }}>{r}</span>
            ))}
            {user.skills.slice(0, 2).map((s) => (
              <span key={s.name} style={{
                padding: "4px 12px", fontSize: 12, fontWeight: 500,
                background: T.surfaceSoft, color: T.ink,
                borderRadius: T.rPill, border: `1px solid ${T.hairline}`,
              }}>{s.name}</span>
            ))}
          </div>

          {user.availability && (
            <div style={{ fontSize: 12, color: "rgba(0,0,0,0.35)", marginTop: 8 }}>
              ⏰ {user.availability}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function FeedPage() {
  const router = useRouter()
  const [users, setUsers] = useState<FeedUser[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [match, setMatch] = useState<MatchModal>({ show: false })
  const [currentIdx, setCurrentIdx] = useState(0)
  const [exiting, setExiting] = useState(false)

  const loadMore = useCallback(async (cur?: string | null) => {
    const res = await fetch(cur ? `/api/feed?cursor=${cur}` : "/api/feed")
    const data = await res.json()
    setUsers((u) => [...u, ...data.users])
    setCursor(data.nextCursor)
    setLoading(false)
  }, [])

  useEffect(() => { loadMore() }, [loadMore])

  const current = users[currentIdx]
  const next = users[currentIdx + 1]

  async function handleLike() {
    if (!current || exiting) return
    setExiting(true)
    const res = await fetch("/api/likes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: current.id }),
    })
    const data = await res.json()
    setTimeout(() => {
      setCurrentIdx((i) => i + 1)
      setExiting(false)
      if (data.match) setMatch({ show: true, matchId: data.matchId, userName: current.name ?? undefined })
    }, 300)
    if (currentIdx >= users.length - 3 && cursor) loadMore(cursor)
  }

  function handlePass() {
    if (exiting) return
    setExiting(true)
    setTimeout(() => { setCurrentIdx((i) => i + 1); setExiting(false) }, 300)
    if (currentIdx >= users.length - 3 && cursor) loadMore(cursor)
  }

  if (loading) {
    return (
      <div style={{ height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
          style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${T.lilac}`, borderTopColor: "transparent" }} />
      </div>
    )
  }

  if (!current) {
    return (
      <div style={{ height: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32 }}>
        <div style={{ width: 72, height: 72, borderRadius: T.rFull, background: T.lilac, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Star size={36} color={T.navy} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 20, color: T.ink, textAlign: "center" }}>Você explorou tudo!</div>
        <div style={{ fontSize: 14, color: "rgba(0,0,0,0.5)", textAlign: "center" }}>Novos perfis em breve.</div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div style={{ height: "100dvh", paddingBottom: 64, display: "flex", flexDirection: "column", background: T.surfaceSoft, maxWidth: 428, margin: "0 auto" }}>

      {/* Header — top-nav: canvas bg, ink text, height 56px */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "40px 16px 12px", flexShrink: 0,
        background: T.canvas, borderBottom: `1px solid ${T.hairlineSoft}`,
      }}>
        <div style={{ fontWeight: 700, fontSize: 22, color: T.ink, letterSpacing: "-0.4px" }}>
          Socio<span style={{ color: T.lilac }}>N</span>
        </div>
        {/* button-icon-circular: surface-soft bg, ink text, 40px */}
        <button style={{
          width: 40, height: 40, borderRadius: T.rFull,
          background: T.surfaceSoft, border: `1px solid ${T.hairline}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <SlidersHorizontal size={16} color={T.ink} />
        </button>
      </div>

      {/* Card stack */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", padding: 16 }}>
        <AnimatePresence>
          {next && <SwipeCard key={next.id + "-bg"} user={next} onLike={() => {}} onPass={() => {}} onView={() => {}} isTop={false} />}
          <SwipeCard key={current.id} user={current} onLike={handleLike} onPass={handlePass}
            onView={() => router.push(`/profile/${current.id}`)} isTop />
        </AnimatePresence>
      </div>

      {/* Action row — button-icon-circular pattern */}
      <div style={{
        flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
        gap: 20, padding: "12px 0",
        background: T.canvas, borderTop: `1px solid ${T.hairlineSoft}`,
      }}>
        {/* Pass */}
        <motion.button
          whileTap={{ scale: 0.82 }}
          animate={{ backgroundColor: T.surfaceSoft }}
          whileHover={{ backgroundColor: "#f3c9b6" }}
          onClick={handlePass}
          style={{
            width: 52, height: 52, borderRadius: T.rFull,
            background: T.surfaceSoft, border: `1px solid ${T.hairline}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
          <X size={20} color="rgba(0,0,0,0.45)" />
        </motion.button>

        {/* Like */}
        <motion.button
          whileTap={{ scale: 0.86, backgroundColor: T.success }}
          onClick={handleLike}
          style={{
            width: 60, height: 60, borderRadius: T.rFull,
            background: T.primary,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "none",
          }}>
          <Heart size={24} fill={T.onPrimary} color={T.onPrimary} />
        </motion.button>

        {/* Profile */}
        <motion.button
          whileTap={{ scale: 0.82 }}
          onClick={() => router.push(`/profile/${current.id}`)}
          style={{
            width: 52, height: 52, borderRadius: T.rFull,
            background: T.surfaceSoft, border: `1px solid ${T.hairline}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
          <Star size={20} color={T.navy} />
        </motion.button>
      </div>

      <BottomNav />

      {/* Match modal — color-block-section-lilac */}
      <AnimatePresence>
        {match.show && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(0,0,0,0.55)" }}>
            <motion.div initial={{ scale: 0.65, y: 32 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.65, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.32 }}
              style={{ width: "100%", maxWidth: 360, background: T.lilac, borderRadius: T.rXl, padding: 40, textAlign: "center" }}>
              <motion.div animate={{ rotate: [0, -12, 12, -12, 0] }} transition={{ delay: 0.2, duration: 0.5 }}
                style={{ fontSize: 48, marginBottom: 16 }}>🎉</motion.div>
              <div style={{ fontWeight: 700, fontSize: 24, color: T.navy, letterSpacing: "-0.3px" }}>É um Match!</div>
              <div style={{ fontSize: 14, color: "rgba(31,29,61,0.6)", marginTop: 6 }}>
                Você e <strong>{match.userName}</strong> se curtiram.
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <button onClick={() => setMatch({ show: false })} style={{
                  flex: 1, padding: "12px 0", fontWeight: 500, fontSize: 14,
                  background: "rgba(31,29,61,0.12)", borderRadius: T.rPill, color: T.navy, border: "none",
                }}>Continuar</button>
                <button onClick={() => { setMatch({ show: false }); router.push(`/partnerships/${match.matchId}`) }} style={{
                  flex: 1, padding: "12px 0", fontWeight: 600, fontSize: 14,
                  background: T.navy, borderRadius: T.rPill, color: T.onPrimary, border: "none",
                }}>Ver parceria</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
