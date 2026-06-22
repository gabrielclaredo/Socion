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
      <div style={{ height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid var(--accent)", borderTopColor: "transparent" }} className="animate-spin" />
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", maxWidth: 428, margin: "0 auto", paddingBottom: 80 }}>
      <div style={{ padding: "48px 20px 16px", background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontWeight: 700, fontSize: 24, color: "var(--text)", letterSpacing: "-0.3px", fontFamily: "var(--font-space, system-ui)" }}>Conexões</h1>
        <p style={{ fontSize: 14, marginTop: 2, color: "var(--text-muted)" }}>
          {partnerships.length} match{partnerships.length !== 1 ? "es" : ""}
        </p>
      </div>

      {partnerships.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 40, marginTop: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={40} color="var(--accent)" />
          </div>
          <h2 style={{ fontWeight: 700, fontSize: 18, textAlign: "center", color: "var(--text)" }}>Nenhuma conexão ainda</h2>
          <p style={{ fontSize: 14, textAlign: "center", color: "var(--text-muted)" }}>Explore perfis e dê likes para criar matches!</p>
          <button onClick={() => router.push("/feed")} style={{
            padding: "12px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer",
            background: "var(--accent)", color: "#fff", borderRadius: 50, border: "none",
          }}>
            Explorar Perfis
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 16 }}>
          {partnerships.map((p) => {
            const partner = getPartner(p)
            const progress = getProgress(p)
            const hasProposal = p.proposals.some((pr) => pr.status === "pending")
            return (
              <button key={p.id} onClick={() => router.push(`/partnerships/${p.id}`)}
                style={{
                  width: "100%", textAlign: "left", padding: 16, display: "flex", alignItems: "center", gap: 12,
                  background: "var(--bg-card)", borderRadius: 24, border: "1px solid var(--border)", cursor: "pointer",
                }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {partner.image ? (
                    <Image src={partner.image} alt={partner.name ?? ""} width={52} height={52} style={{ borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, background: "var(--accent-light)", color: "var(--accent)" }}>
                      {partner.name?.[0] ?? "?"}
                    </div>
                  )}
                  <div style={{ position: "absolute", bottom: -2, right: -2, width: 16, height: 16, borderRadius: "50%", border: "2px solid var(--bg-card)", background: "var(--success)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <h3 style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{partner.name}</h3>
                    {hasProposal && (
                      <span style={{
                        fontSize: 11, padding: "2px 8px", fontWeight: 600, flexShrink: 0,
                        background: "var(--accent-light)", color: "var(--accent)", borderRadius: 50,
                      }}>
                        Proposta
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, marginTop: 2, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{partner.headline}</p>
                  <div style={{ marginTop: 8, height: 4, borderRadius: 4, background: "var(--border)" }}>
                    <div style={{ height: "100%", borderRadius: 4, width: `${progress}%`, background: "var(--accent)" }} />
                  </div>
                  <p style={{ fontSize: 11, marginTop: 4, color: "var(--text-muted)" }}>{progress}% da jornada</p>
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
