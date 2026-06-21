"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import { LogOut, Shield, CreditCard } from "lucide-react"
import { BottomNav } from "@/components/layout/BottomNav"
import { TrustBadge } from "@/components/layout/TrustBadge"

const ROLES = ["Tecnologia", "Marketing", "Produto", "Vendas", "Operações", "Finanças", "Jurídico", "Design"]
const AVAILABILITY = ["10h/semana", "20h/semana", "40h/semana (Full Time)"]

interface Profile {
  id: string; name: string | null; image: string | null; headline: string | null
  location: string | null; trustScore: number; availability: string | null
  offeredRoles: string[]; desiredRoles: string[]; businessType: string[]
  plan: string; trialEndsAt: string | null
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ headline: "", location: "", availability: "", offeredRoles: [] as string[] })

  useEffect(() => {
    fetch("/api/users/profile").then((r) => r.json()).then((d) => {
      setProfile(d)
      setForm({ headline: d.headline ?? "", location: d.location ?? "", availability: d.availability ?? "", offeredRoles: d.offeredRoles ?? [] })
    })
  }, [])

  function toggle(value: string) {
    setForm((f) => ({
      ...f,
      offeredRoles: f.offeredRoles.includes(value) ? f.offeredRoles.filter((v) => v !== value) : [...f.offeredRoles, value],
    }))
  }

  async function save() {
    setSaving(true)
    await fetch("/api/users/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const updated = await fetch("/api/users/profile").then((r) => r.json())
    setProfile(updated)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#080E1A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7B61FF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const daysLeft = profile.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(profile.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="min-h-screen bg-[#080E1A] max-w-sm mx-auto pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-white text-2xl font-bold font-outfit">Meu Perfil</h1>
      </div>

      {/* Profile card */}
      <div className="mx-4 bg-[#0F1A2E] rounded-2xl p-5 mb-5 flex items-center gap-4">
        {profile.image ? (
          <Image src={profile.image} alt={profile.name ?? ""} width={64} height={64} className="rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#7B61FF]/30 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">{profile.name?.[0] ?? "?"}</span>
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-white font-bold text-lg">{profile.name}</h2>
          <p className="text-white/60 text-sm">{session?.user?.email}</p>
        </div>
        <TrustBadge score={profile.trustScore} size="md" />
      </div>

      {/* Trial banner */}
      {profile.plan === "TRIAL" && daysLeft > 0 && (
        <div className="mx-4 mb-5 bg-[#FFD60A]/10 border border-[#FFD60A]/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[#FFD60A] font-semibold text-sm">Trial ativo</p>
            <p className="text-white/60 text-xs">{daysLeft} dias restantes</p>
          </div>
          <a href="/settings/billing" className="px-4 py-2 bg-[#FFD60A] text-[#0A1628] font-bold text-xs rounded-xl">
            Fazer upgrade
          </a>
        </div>
      )}

      {/* Edit form */}
      <div className="mx-4 bg-[#0F1A2E] rounded-2xl p-4 mb-5">
        <h3 className="text-white font-semibold mb-4">Editar Perfil</h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-white/60 mb-1 block">Headline</label>
            <input value={form.headline} onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
              placeholder="Ex: CTO buscando co-fundador"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#7B61FF]" />
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Localização</label>
            <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Ex: São Paulo, SP"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#7B61FF]" />
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Disponibilidade</label>
            <div className="flex flex-col gap-1">
              {AVAILABILITY.map((a) => (
                <button key={a} onClick={() => setForm((f) => ({ ...f, availability: a }))}
                  className={`text-left px-3 py-2 rounded-xl text-sm border transition-all ${form.availability === a ? "bg-[#7B61FF] text-white border-[#7B61FF]" : "bg-white/5 text-white/70 border-white/10"}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Minhas habilidades</label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button key={r} onClick={() => toggle(r)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${form.offeredRoles.includes(r) ? "bg-[#7B61FF] text-white border-[#7B61FF]" : "bg-white/5 text-white/60 border-white/10"}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={save} disabled={saving}
          className="w-full mt-4 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-all"
          style={{ background: saved ? "#22C55E" : "#7B61FF" }}>
          {saved ? "✓ Salvo!" : saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>

      {/* Menu items */}
      <div className="mx-4 bg-[#0F1A2E] rounded-2xl overflow-hidden mb-5">
        <a href="/settings/billing" className="flex items-center gap-3 px-4 py-4 border-b border-white/5 hover:bg-white/5">
          <CreditCard className="w-5 h-5 text-[#7B61FF]" />
          <span className="text-white text-sm font-medium">Plano e cobrança</span>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${profile.plan === "PRO" ? "bg-[#7B61FF]/20 text-[#7B61FF]" : "bg-[#FFD60A]/20 text-[#FFD60A]"}`}>
            {profile.plan === "PRO" ? "PRO" : `Trial · ${daysLeft}d`}
          </span>
        </a>
        <button className="w-full flex items-center gap-3 px-4 py-4 border-b border-white/5 hover:bg-white/5">
          <Shield className="w-5 h-5 text-[#22C55E]" />
          <span className="text-white text-sm font-medium">Verificação de identidade</span>
          <span className="ml-auto text-xs text-white/40">Em breve</span>
        </button>
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-white/5">
          <LogOut className="w-5 h-5 text-red-400" />
          <span className="text-red-400 text-sm font-medium">Sair</span>
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
