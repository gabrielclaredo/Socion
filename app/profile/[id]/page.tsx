"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, MapPin, Clock, Briefcase, Shield } from "lucide-react"
import { TrustBadge } from "@/components/layout/TrustBadge"

interface UserProfile {
  id: string; name: string | null; image: string | null; headline: string | null
  location: string | null; trustScore: number; identityScore: number; experienceScore: number
  competenceScore: number; reputationScore: number; commitmentScore: number; compatibilityScore: number
  availability: string | null; investmentRange: string | null; businessType: string[]
  offeredRoles: string[]; desiredRoles: string[]; verificationStatus: string
  skills: { id: string; name: string; category: string; validated: boolean }[]
  projects: { id: string; title: string; description: string; duration: string | null; results: string | null }[]
  values: { question: string; answer: string }[]
  commonConnections: number
}

const SCORE_LABELS = [
  { key: "identityScore", label: "Identidade" },
  { key: "experienceScore", label: "Experiência" },
  { key: "competenceScore", label: "Competências" },
  { key: "reputationScore", label: "Reputação" },
  { key: "commitmentScore", label: "Comprometimento" },
]

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [liking, setLiking] = useState(false)

  useEffect(() => {
    fetch(`/api/users/${id}`).then((r) => r.json()).then(setUser)
  }, [id])

  async function handleLike() {
    if (!user) return
    setLiking(true)
    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: user.id }),
    })
    const data = await res.json()
    setLiking(false)
    if (data.match) {
      router.push(`/partnerships/${data.matchId}`)
    } else {
      router.back()
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#080E1A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7B61FF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080E1A] max-w-sm mx-auto">
      {/* Hero */}
      <div className="relative h-72" style={{ background: "linear-gradient(160deg, #7B61FF 0%, #4F35CC 100%)" }}>
        {user.image && <Image src={user.image} alt={user.name ?? ""} fill className="object-cover opacity-50" />}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,14,26,1) 0%, transparent 60%)" }} />
        <button onClick={() => router.back()}
          className="absolute top-12 left-4 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        {user.verificationStatus === "VERIFIED" && (
          <div className="absolute top-12 right-4 flex items-center gap-1 bg-[#22C55E]/20 px-3 py-1 rounded-full">
            <Shield className="w-3 h-3 text-[#22C55E]" />
            <span className="text-[#22C55E] text-xs font-semibold">Verificado</span>
          </div>
        )}
      </div>

      <div className="px-5 pb-32 -mt-8 relative">
        {/* Name + Trust */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="text-white text-2xl font-bold font-outfit">{user.name}</h1>
            <p className="text-white/70 text-sm">{user.headline}</p>
          </div>
          <TrustBadge score={user.trustScore} size="lg" />
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 mb-5">
          {user.location && <span className="flex items-center gap-1 text-white/60 text-xs"><MapPin className="w-3 h-3" />{user.location}</span>}
          {user.availability && <span className="flex items-center gap-1 text-white/60 text-xs"><Clock className="w-3 h-3" />{user.availability}</span>}
          {user.investmentRange && <span className="flex items-center gap-1 text-white/60 text-xs"><Briefcase className="w-3 h-3" />{user.investmentRange}</span>}
        </div>

        {user.commonConnections > 0 && (
          <div className="bg-[#7B61FF]/20 border border-[#7B61FF]/30 rounded-xl p-3 mb-5">
            <p className="text-[#7B61FF] text-sm font-medium">
              🤝 {user.commonConnections} conexão em comum
            </p>
          </div>
        )}

        {/* Trust Score breakdown */}
        <div className="bg-[#0F1A2E] rounded-2xl p-4 mb-5">
          <h3 className="text-white font-semibold mb-4">Trust Score</h3>
          <div className="flex flex-col gap-3">
            {SCORE_LABELS.map(({ key, label }) => {
              const val = user[key as keyof UserProfile] as number
              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-white/70 text-xs">{label}</span>
                    <span className="text-white text-xs font-semibold">{val}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full">
                    <div className="h-full bg-[#7B61FF] rounded-full transition-all" style={{ width: `${val}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Skills */}
        {user.skills.length > 0 && (
          <div className="mb-5">
            <h3 className="text-white font-semibold mb-3">Competências</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((s) => (
                <span key={s.id} className={`px-3 py-1 rounded-full text-xs font-medium ${s.validated ? "bg-[#22C55E]/20 text-[#22C55E]" : "bg-white/10 text-white/70"}`}>
                  {s.name} {s.validated && "✓"}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {user.projects.length > 0 && (
          <div className="mb-5">
            <h3 className="text-white font-semibold mb-3">Projetos</h3>
            <div className="flex flex-col gap-3">
              {user.projects.map((p) => (
                <div key={p.id} className="bg-[#0F1A2E] rounded-xl p-4">
                  <h4 className="text-white font-medium text-sm">{p.title}</h4>
                  <p className="text-white/60 text-xs mt-1">{p.description}</p>
                  {p.duration && <span className="text-white/40 text-xs">⏱ {p.duration}</span>}
                  {p.results && <p className="text-[#22C55E] text-xs mt-1">📈 {p.results}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Values */}
        {user.values.length > 0 && (
          <div className="mb-5">
            <h3 className="text-white font-semibold mb-3">Valores</h3>
            <div className="flex flex-col gap-2">
              {user.values.map((v) => (
                <div key={v.question} className="flex justify-between items-center bg-[#0F1A2E] rounded-xl px-4 py-3">
                  <span className="text-white/70 text-xs">{v.question}</span>
                  <span className="text-[#7B61FF] text-xs font-semibold">{v.answer}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roles */}
        {user.offeredRoles.length > 0 && (
          <div className="mb-5">
            <h3 className="text-white font-semibold mb-3">O que oferece</h3>
            <div className="flex flex-wrap gap-2">
              {user.offeredRoles.map((r) => (
                <span key={r} className="px-3 py-1 bg-[#FF6B35]/20 text-[#FF6B35] text-xs rounded-full">{r}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto p-4 bg-[#080E1A] border-t border-white/10">
        <button onClick={handleLike} disabled={liking}
          className="w-full py-4 rounded-2xl text-white font-bold text-base disabled:opacity-60 transition-opacity"
          style={{ background: "linear-gradient(135deg, #7B61FF, #FF6B35)" }}>
          {liking ? "Curtindo..." : "❤️ Curtir Perfil"}
        </button>
      </div>
    </div>
  )
}
