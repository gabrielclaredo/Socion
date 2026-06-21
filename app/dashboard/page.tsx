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
      <div className="flex items-center justify-center" style={{ height: "100dvh" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--color-block-lilac)" }} />
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto" style={{ minHeight: "100dvh", background: "var(--color-canvas)", paddingBottom: 80 }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4" style={{ borderBottom: "1px solid var(--color-hairline-soft)" }}>
        <h1 className="font-bold text-2xl" style={{ color: "var(--color-ink)", letterSpacing: "-0.3px" }}>Mensagens</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(0,0,0,0.45)" }}>
          {convs.length} conversa{convs.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search */}
      <div className="px-4 py-3" style={{ background: "var(--color-canvas)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--rounded-md)]" style={{ background: "var(--color-surface-soft)" }}>
          <Search className="w-4 h-4 shrink-0" style={{ color: "rgba(0,0,0,0.35)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversa..."
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: "var(--color-ink)" }}
          />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 p-10 mt-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "var(--color-block-lilac)" }}>
            <MessageSquare className="w-10 h-10" style={{ color: "var(--color-block-navy)" }} />
          </div>
          <h2 className="font-bold text-lg text-center" style={{ color: "var(--color-ink)" }}>
            {search ? "Nenhum resultado" : "Nenhuma mensagem ainda"}
          </h2>
          <p className="text-sm text-center" style={{ color: "rgba(0,0,0,0.5)" }}>
            {search ? "Tente outro nome." : "Quando você tiver um match, a conversa aparece aqui."}
          </p>
          {!search && (
            <button onClick={() => router.push("/feed")} className="px-6 py-3 font-semibold text-sm"
              style={{ background: "var(--color-primary)", color: "var(--color-canvas)", borderRadius: "var(--rounded-pill)" }}>
              Explorar Perfis
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col">
          {filtered.map((c) => {
            const partner = getPartner(c)
            const lastMsg = getLastMessage(c)
            const hasProposal = c.proposals.some((p) => p.status === "pending")
            return (
              <button
                key={c.id}
                onClick={() => router.push(`/partnerships/${c.id}`)}
                className="w-full text-left flex items-center gap-3 px-5 py-4 transition-colors"
                style={{ borderBottom: "1px solid var(--color-hairline-soft)" }}
              >
                <div className="relative shrink-0">
                  {partner.image ? (
                    <Image src={partner.image} alt={partner.name ?? ""} width={52} height={52} className="rounded-full object-cover" />
                  ) : (
                    <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center font-bold text-lg"
                      style={{ background: "var(--color-block-lilac)", color: "var(--color-block-navy)" }}>
                      {partner.name?.[0] ?? "?"}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white"
                    style={{ background: "var(--color-success)" }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm truncate" style={{ color: "var(--color-ink)" }}>{partner.name}</span>
                    <span className="text-xs shrink-0" style={{ color: "rgba(0,0,0,0.35)" }}>{timeAgo(c.updatedAt)}</span>
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(0,0,0,0.5)" }}>{lastMsg}</p>
                </div>

                {hasProposal && (
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: "var(--color-block-navy)" }} />
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
