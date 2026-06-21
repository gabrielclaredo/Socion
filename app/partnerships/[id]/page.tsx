"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { ArrowLeft, CheckCircle2, Circle, Send } from "lucide-react"
import { TrustBadge } from "@/components/layout/TrustBadge"

interface PartnershipDetail {
  id: string; status: string
  userA: { id: string; name: string | null; image: string | null; headline: string | null; trustScore: number; offeredRoles: string[] }
  userB: { id: string; name: string | null; image: string | null; headline: string | null; trustScore: number; offeredRoles: string[] }
  proposals: { id: string; senderId: string; receiverId: string; equity: number; role: string; investmentType: string; message: string; status: string; createdAt: string }[]
  timeline: { id: string; title: string; description: string | null; completed: boolean; completedAt: string | null }[]
}

export default function PartnershipDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const router = useRouter()
  const [p, setP] = useState<PartnershipDetail | null>(null)
  const [showProposalForm, setShowProposalForm] = useState(false)
  const [form, setForm] = useState({ equity: 50, role: "", investmentType: "Tempo e conhecimento", message: "" })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/partnerships/${id}`).then((r) => r.json()).then(setP)
  }, [id])

  function getPartner() {
    if (!p || !session?.user?.id) return null
    return p.userA.id === session.user.id ? p.userB : p.userA
  }

  async function submitProposal() {
    if (!p || !session?.user?.id) return
    const partner = getPartner()
    if (!partner) return
    setSubmitting(true)
    await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnershipId: p.id, receiverId: partner.id, ...form }),
    })
    const updated = await fetch(`/api/partnerships/${id}`).then((r) => r.json())
    setP(updated)
    setShowProposalForm(false)
    setSubmitting(false)
  }

  async function respondProposal(proposalId: string, status: "accepted" | "rejected") {
    await fetch(`/api/proposals/${proposalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    const updated = await fetch(`/api/partnerships/${id}`).then((r) => r.json())
    setP(updated)
  }

  if (!p) {
    return (
      <div className="min-h-screen bg-[#080E1A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7B61FF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const partner = getPartner()
  const myProposal = p.proposals.find((pr) => pr.senderId === session?.user?.id)
  const theirProposal = p.proposals.find((pr) => pr.receiverId === session?.user?.id && pr.status === "sent")
  const progress = Math.round((p.timeline.filter((t) => t.completed).length / Math.max(p.timeline.length, 1)) * 100)

  return (
    <div className="min-h-screen bg-[#080E1A] max-w-sm mx-auto pb-32">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-white font-bold text-lg font-outfit">Sala da Sociedade</h1>
      </div>

      {/* Partner card */}
      {partner && (
        <div className="mx-4 bg-[#0F1A2E] rounded-2xl p-4 flex items-center gap-4 mb-5">
          {partner.image ? (
            <Image src={partner.image} alt={partner.name ?? ""} width={56} height={56} className="rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#7B61FF]/30 flex items-center justify-center">
              <span className="text-white font-bold text-xl">{partner.name?.[0] ?? "?"}</span>
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-white font-bold">{partner.name}</h2>
            <p className="text-white/60 text-sm">{partner.headline}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {partner.offeredRoles.slice(0, 2).map((r) => (
                <span key={r} className="text-xs px-2 py-0.5 bg-[#7B61FF]/20 text-[#7B61FF] rounded-full">{r}</span>
              ))}
            </div>
          </div>
          <TrustBadge score={partner.trustScore} size="md" />
        </div>
      )}

      {/* Progress */}
      <div className="mx-4 mb-5">
        <div className="flex justify-between mb-2">
          <span className="text-white/60 text-xs">Progresso da sociedade</span>
          <span className="text-white text-xs font-bold">{progress}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full">
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #7B61FF, #FF6B35)" }} />
        </div>
      </div>

      {/* Timeline */}
      <div className="mx-4 mb-5">
        <h3 className="text-white font-semibold mb-3">Jornada</h3>
        <div className="flex flex-col">
          {p.timeline.map((t, i) => (
            <div key={t.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                {t.completed
                  ? <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
                  : <Circle className="w-5 h-5 text-white/20 shrink-0" />}
                {i < p.timeline.length - 1 && <div className={`w-0.5 flex-1 min-h-4 ${t.completed ? "bg-[#22C55E]/40" : "bg-white/10"}`} />}
              </div>
              <div className="pb-4">
                <p className={`text-sm font-medium ${t.completed ? "text-white" : "text-white/40"}`}>{t.title}</p>
                {t.description && <p className="text-white/40 text-xs mt-0.5">{t.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incoming proposal */}
      {theirProposal && (
        <div className="mx-4 mb-5 bg-[#7B61FF]/10 border border-[#7B61FF]/30 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-2">📬 Proposta recebida</h3>
          <div className="flex gap-3 mb-3 text-sm text-white/70">
            <span>Participação: <strong className="text-white">{theirProposal.equity}%</strong></span>
            <span>Papel: <strong className="text-white">{theirProposal.role}</strong></span>
          </div>
          <p className="text-white/70 text-sm mb-4">{theirProposal.message}</p>
          <div className="flex gap-3">
            <button onClick={() => respondProposal(theirProposal.id, "rejected")}
              className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm font-medium">
              Recusar
            </button>
            <button onClick={() => respondProposal(theirProposal.id, "accepted")}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: "#22C55E" }}>
              Aceitar ✓
            </button>
          </div>
        </div>
      )}

      {/* My proposal status */}
      {myProposal && (
        <div className="mx-4 mb-5 bg-[#0F1A2E] rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-2">📤 Proposta enviada</h3>
          <div className="flex gap-3 text-sm text-white/70 mb-2">
            <span>Participação: <strong className="text-white">{myProposal.equity}%</strong></span>
            <span>Papel: <strong className="text-white">{myProposal.role}</strong></span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            myProposal.status === "accepted" ? "bg-[#22C55E]/20 text-[#22C55E]" :
            myProposal.status === "rejected" ? "bg-red-500/20 text-red-400" :
            "bg-[#FFD60A]/20 text-[#FFD60A]"}`}>
            {myProposal.status === "accepted" ? "✓ Aceita" : myProposal.status === "rejected" ? "✗ Recusada" : "⏳ Aguardando"}
          </span>
        </div>
      )}

      {/* Proposal form */}
      {showProposalForm && (
        <div className="mx-4 mb-5 bg-[#0F1A2E] rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-4">Nova Proposta</h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Participação societária: {form.equity}%</label>
              <input type="range" min={1} max={99} value={form.equity} onChange={(e) => setForm((f) => ({ ...f, equity: +e.target.value }))}
                className="w-full accent-[#7B61FF]" />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Papel (CEO, CTO, CMO...)</label>
              <input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                placeholder="Ex: CTO"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-[#7B61FF]" />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Tipo de investimento</label>
              {["Tempo e conhecimento", "Capital", "Ambos"].map((opt) => (
                <button key={opt} onClick={() => setForm((f) => ({ ...f, investmentType: opt }))}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm mb-1 border transition-all ${form.investmentType === opt ? "bg-[#7B61FF] text-white border-[#7B61FF]" : "bg-white/5 text-white/70 border-white/10"}`}>
                  {opt}
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Mensagem</label>
              <textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Descreva sua proposta..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-[#7B61FF] resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowProposalForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm">
                Cancelar
              </button>
              <button onClick={submitProposal} disabled={!form.role || !form.message || submitting}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40" style={{ background: "#7B61FF" }}>
                {submitting ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      {!myProposal && !theirProposal && !showProposalForm && (
        <div className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto p-4 bg-[#080E1A] border-t border-white/10">
          <button onClick={() => setShowProposalForm(true)}
            className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #7B61FF, #FF6B35)" }}>
            <Send className="w-4 h-4" /> Enviar Proposta de Sociedade
          </button>
        </div>
      )}
    </div>
  )
}
