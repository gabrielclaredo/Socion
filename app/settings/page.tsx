"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import { LogOut, Shield, CreditCard, ChevronRight } from "lucide-react"
import { BottomNav } from "@/components/layout/BottomNav"

const T = {
  canvas: "#ffffff", ink: "#000000", surfaceSoft: "#f7f7f5",
  hairline: "#e6e6e6", hairlineSoft: "#f1f1f1",
  lilac: "#c5b0f4", navy: "#1f1d3d", lime: "#dceeb1",
  success: "#1ea64a", magenta: "#ff3d8b",
  rMd: "8px", rLg: "24px", rPill: "50px", rFull: "9999px",
}

const ROLES = ["Tecnologia", "Marketing", "Produto", "Vendas", "Operações", "Finanças", "Design"]
const AVAILABILITY = ["10h/semana", "20h/semana", "40h/semana (Full Time)"]

interface Profile {
  id: string; name: string | null; image: string | null; headline: string | null
  location: string | null; trustScore: number; availability: string | null
  offeredRoles: string[]; plan: string; trialEndsAt: string | null
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
    await fetch("/api/users/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    const updated = await fetch("/api/users/profile").then((r) => r.json())
    setProfile(updated)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!profile) {
    return (
      <div style={{ height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: T.surfaceSoft }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${T.lilac}`, borderTopColor: "transparent", animation: "spin 0.9s linear infinite" }} />
      </div>
    )
  }

  const daysLeft = profile.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(profile.trialEndsAt).getTime() - Date.now()) / 86400000))
    : 0

  const trustColor = profile.trustScore >= 80 ? T.success : profile.trustScore >= 60 ? T.lilac : "#f3c9b6"

  return (
    <div style={{ minHeight: "100dvh", background: T.surfaceSoft, maxWidth: 428, margin: "0 auto", paddingBottom: 80 }}>

      {/* Profile hero — lilac color block */}
      <div style={{ background: T.lilac, padding: "52px 20px 28px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            {profile.image ? (
              <Image src={profile.image} alt={profile.name ?? ""} width={72} height={72}
                style={{ borderRadius: T.rFull, objectFit: "cover", border: `3px solid ${T.canvas}` }} />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: T.rFull, background: T.navy, display: "flex", alignItems: "center", justifyContent: "center", border: `3px solid ${T.canvas}` }}>
                <span style={{ fontWeight: 700, fontSize: 28, color: T.lilac }}>{profile.name?.[0] ?? "?"}</span>
              </div>
            )}
            {/* Trust badge */}
            <div style={{
              position: "absolute", bottom: -4, right: -4,
              width: 28, height: 28, borderRadius: T.rFull,
              background: T.canvas, border: `2px solid ${trustColor}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontWeight: 700, fontSize: 10, color: T.ink }}>{profile.trustScore}</span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: T.navy, letterSpacing: "-0.3px", lineHeight: 1.25 }}>
              {profile.name}
            </div>
            <div style={{ fontSize: 13, color: "rgba(31,29,61,0.6)", marginTop: 2 }}>
              {session?.user?.email}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <span style={{
                padding: "3px 10px", fontSize: 11, fontWeight: 600,
                background: T.navy, color: T.lilac, borderRadius: T.rPill,
                letterSpacing: "0.05em", textTransform: "uppercase",
              }}>
                {profile.plan === "PRO" ? "PRO" : `Trial · ${daysLeft}d`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trial banner */}
      {profile.plan === "TRIAL" && daysLeft > 0 && (
        <div style={{ margin: "16px 16px 0", padding: "14px 16px", background: T.lime, borderRadius: T.rLg, display: "flex", alignItems: "center", justifyContent: "space-between" } as React.CSSProperties}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: T.ink }}>Trial ativo</div>
            <div style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", marginTop: 1 }}>{daysLeft} dias restantes</div>
          </div>
          <a href="/settings/billing" style={{
            padding: "8px 16px", background: T.ink, color: T.canvas,
            fontSize: 13, fontWeight: 600, borderRadius: T.rPill, textDecoration: "none",
          }}>Upgrade</a>
        </div>
      )}

      {/* Edit form */}
      <div style={{ margin: "16px 16px 0", background: T.canvas, borderRadius: T.rLg, border: `1px solid ${T.hairline}`, padding: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: T.ink, marginBottom: 16 }}>Editar Perfil</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Headline</label>
            <input value={form.headline} onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
              placeholder="Ex: CTO buscando co-fundador"
              style={{ width: "100%", padding: "10px 14px", fontSize: 14, color: T.ink, background: T.surfaceSoft, border: `1px solid ${T.hairline}`, borderRadius: T.rMd, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Localização</label>
            <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Ex: São Paulo, SP"
              style={{ width: "100%", padding: "10px 14px", fontSize: 14, color: T.ink, background: T.surfaceSoft, border: `1px solid ${T.hairline}`, borderRadius: T.rMd, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Disponibilidade</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {AVAILABILITY.map((a) => (
                <button key={a} onClick={() => setForm((f) => ({ ...f, availability: a }))}
                  style={{
                    textAlign: "left", padding: "10px 14px", fontSize: 14, fontWeight: 500,
                    borderRadius: T.rMd, border: `1px solid ${form.availability === a ? T.navy : T.hairline}`,
                    background: form.availability === a ? T.navy : T.canvas,
                    color: form.availability === a ? T.canvas : T.ink,
                    cursor: "pointer",
                  }}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Minhas habilidades</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ROLES.map((r) => (
                <button key={r} onClick={() => toggle(r)}
                  style={{
                    padding: "6px 14px", fontSize: 13, fontWeight: 500,
                    borderRadius: T.rPill, border: `1px solid ${form.offeredRoles.includes(r) ? T.navy : T.hairline}`,
                    background: form.offeredRoles.includes(r) ? T.navy : T.canvas,
                    color: form.offeredRoles.includes(r) ? T.canvas : T.ink,
                    cursor: "pointer",
                  }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={save} disabled={saving} style={{
          width: "100%", marginTop: 20, padding: "13px 0",
          fontWeight: 600, fontSize: 15,
          background: saved ? T.success : T.ink,
          color: T.canvas, borderRadius: T.rPill, border: "none",
          cursor: "pointer", opacity: saving ? 0.5 : 1,
          transition: "background 0.2s",
        }}>
          {saved ? "✓ Salvo!" : saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>

      {/* Menu */}
      <div style={{ margin: "16px 16px 0", background: T.canvas, borderRadius: T.rLg, border: `1px solid ${T.hairline}`, overflow: "hidden" }}>
        <a href="/settings/billing" style={{
          display: "flex", alignItems: "center", gap: 12, padding: "16px 20px",
          borderBottom: `1px solid ${T.hairlineSoft}`, textDecoration: "none",
        }}>
          <div style={{ width: 36, height: 36, borderRadius: T.rFull, background: T.lilac, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CreditCard size={16} color={T.navy} />
          </div>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: T.ink }}>Plano e cobrança</span>
          <ChevronRight size={16} color="rgba(0,0,0,0.3)" />
        </a>
        <button style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "16px 20px",
          borderBottom: `1px solid ${T.hairlineSoft}`, background: "none", border: "none", cursor: "pointer",
        }}>
          <div style={{ width: 36, height: 36, borderRadius: T.rFull, background: "#c8e6cd", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={16} color={T.success} />
          </div>
          <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 500, color: T.ink }}>Verificação de identidade</span>
          <span style={{ fontSize: 11, color: "rgba(0,0,0,0.35)" }}>Em breve</span>
        </button>
        <button onClick={() => signOut({ callbackUrl: "/login" })} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "16px 20px",
          background: "none", border: "none", cursor: "pointer",
        }}>
          <div style={{ width: 36, height: 36, borderRadius: T.rFull, background: "#fde8e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LogOut size={16} color="#e53e3e" />
          </div>
          <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 500, color: "#e53e3e" }}>Sair</span>
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
