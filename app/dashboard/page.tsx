"use client"
// messages
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { MessageSquare, Search } from "lucide-react"
import { BottomNav } from "@/components/layout/BottomNav"

interface Conversation {
  id: string
  status: string
  updatedAt: string
  userA: { id: string; name: string | null; image: string | null; headline: string | null }
  userB: { id: string; name: string | null; image: string | null; headline: string | null }
  proposals: { id: string; status: string; createdAt: string; message: string | null }[]
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "agora"
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [convs, setConvs] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/partnerships")
      .then((r) => r.json())
      .then((d) => { setConvs(d); setLoading(false) })
  }, [])

  function getPartner(c: Conversation) {
    return c.userA.id === session?.user?.id ? c.userB : c.userA
  }

  function getLastMessage(c: Conversation) {
    const last = c.proposals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    if (!last) return "Novo match! Inicie uma conversa."
    return last.message ?? "Proposta enviada"
  }

  const filtered = convs.filter((c) => {
    const name = getPartner(c).name?.toLowerCase() ?? ""
    return name.includes(search.toLowerCase())
  })

  if (loading) {
    return (
      <div style={{ height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid var(--accent)", borderTopColor: "transparent" }} className="animate-spin" />
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", maxWidth: 428, margin: "0 auto", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "48px 20px 16px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontWeight: 700, fontSize: 24, color: "var(--text)", letterSpacing: "-0.3px", fontFamily: "var(--font-space, system-ui)" }}>Mensagens</h1>
        <p style={{ fontSize: 14, marginTop: 2, color: "var(--text-muted)" }}>
          {convs.length} conversa{convs.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversa..."
            style={{ flex: 1, fontSize: 14, background: "transparent", outline: "none", border: "none", color: "var(--text)" }}
          />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 40, marginTop: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MessageSquare size={40} color="var(--accent)" />
          </div>
          <h2 style={{ fontWeight: 700, fontSize: 18, textAlign: "center", color: "var(--text)" }}>
            {search ? "Nenhum resultado" : "Nenhuma mensagem ainda"}
          </h2>
          <p style={{ fontSize: 14, textAlign: "center", color: "var(--text-muted)" }}>
            {search ? "Tente outro nome." : "Quando você tiver um match, a conversa aparece aqui."}
          </p>
          {!search && (
            <button onClick={() => router.push("/feed")} style={{
              padding: "12px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer",
              background: "var(--accent)", color: "#fff", borderRadius: 50, border: "none",
            }}>
              Explorar Perfis
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {filtered.map((c) => {
            const partner = getPartner(c)
            const lastMsg = getLastMessage(c)
            const hasProposal = c.proposals.some((p) => p.status === "pending")
            return (
              <button
                key={c.id}
                onClick={() => router.push(`/partnerships/${c.id}`)}
                style={{
                  width: "100%", textAlign: "left", display: "flex", alignItems: "center",
                  gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--border)",
                  background: "none", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer",
                }}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {partner.image ? (
                    <Image src={partner.image} alt={partner.name ?? ""} width={52} height={52} style={{ borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, background: "var(--accent-light)", color: "var(--accent)" }}>
                      {partner.name?.[0] ?? "?"}
                    </div>
                  )}
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 14, height: 14, borderRadius: "50%", border: "2px solid var(--bg)", background: "var(--success)" }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{partner.name}</span>
                    <span style={{ fontSize: 12, flexShrink: 0, color: "var(--text-muted)" }}>{timeAgo(c.updatedAt)}</span>
                  </div>
                  <p style={{ fontSize: 12, marginTop: 2, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lastMsg}</p>
                </div>

                {hasProposal && (
                  <div style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: "var(--accent)" }} />
                )}
              </button>
            )
          })}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
