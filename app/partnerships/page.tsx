"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Users } from "lucide-react"
import { BottomNav } from "@/components/layout/BottomNav"

interface Partnership {
  id: string; status: string
  userA: { id: string; name: string | null; image: string | null; headline: string | null; trustScore: number }
  userB: { id: string; name: string | null; image: string | null; headline: string | null; trustScore: number }
  proposals: { status: string }[]
  timeline: { completed: boolean }[]
}

export default function PartnershipsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/partnerships").then((r) => r.json()).then((d) => { setPartnerships(d); setLoading(false) })
  }, [])

  function getPartner(p: Partnership) {
    return p.userA.id === session?.user?.id ? p.userB : p.userA
  }

  function getProgress(p: Partnership) {
    const done = p.timeline.filter((t) => t.completed).length
    return Math.round((done / Math.max(p.timeline.length, 1)) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: "100dvh" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--color-block-lilac)" }} />
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto" style={{ minHeight: "100dvh", background: "var(--color-surface-soft)", paddingBottom: 80 }}>
      <div className="px-5 pt-12 pb-4" style={{ background: "var(--color-canvas)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
        <h1 className="font-bold text-2xl" style={{ color: "var(--color-ink)", letterSpacing: "-0.3px" }}>Conexões</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(0,0,0,0.45)" }}>
          {partnerships.length} match{partnerships.length !== 1 ? "es" : ""}
        </p>
      </div>

      {partnerships.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 p-10 mt-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "var(--color-block-lilac)" }}>
            <Users className="w-10 h-10" style={{ color: "var(--color-block-navy)" }} />
          </div>
          <h2 className="font-bold text-lg text-center" style={{ color: "var(--color-ink)" }}>Nenhuma conexão ainda</h2>
          <p className="text-sm text-center" style={{ color: "rgba(0,0,0,0.5)" }}>Explore perfis e dê likes para criar matches!</p>
          <button onClick={() => router.push("/feed")} className="px-6 py-3 font-semibold text-sm"
            style={{ background: "var(--color-primary)", color: "var(--color-canvas)", borderRadius: "var(--rounded-pill)" }}>
            Explorar Perfis
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-4">
          {partnerships.map((p) => {
            const partner = getPartner(p)
            const progress = getProgress(p)
            const hasProposal = p.proposals.some((pr) => pr.status === "pending")
            return (
              <button key={p.id} onClick={() => router.push(`/partnerships/${p.id}`)}
                className="w-full text-left p-4 flex items-center gap-3 transition-colors"
                style={{ background: "var(--color-canvas)", borderRadius: "var(--rounded-lg)", border: "1px solid var(--color-hairline)" }}>
                <div className="relative shrink-0">
                  {partner.image ? (
                    <Image src={partner.image} alt={partner.name ?? ""} width={52} height={52} className="rounded-full object-cover" />
                  ) : (
                    <div className="w-13 h-13 w-[52px] h-[52px] rounded-full flex items-center justify-center font-bold text-lg"
                      style={{ background: "var(--color-block-lilac)", color: "var(--color-block-navy)" }}>
                      {partner.name?.[0] ?? "?"}
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white" style={{ background: "var(--color-success)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm truncate" style={{ color: "var(--color-ink)" }}>{partner.name}</h3>
                    {hasProposal && (
                      <span className="text-xs px-2 py-0.5 font-medium shrink-0"
                        style={{ background: "var(--color-block-lilac)", color: "var(--color-block-navy)", borderRadius: "var(--rounded-pill)" }}>
                        Proposta
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(0,0,0,0.45)" }}>{partner.headline}</p>
                  <div className="mt-2 h-1 rounded-full" style={{ background: "var(--color-hairline)" }}>
                    <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "var(--color-block-navy)" }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: "rgba(0,0,0,0.35)" }}>{progress}% da jornada</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
      <BottomNav />
    </div>
  )
}
