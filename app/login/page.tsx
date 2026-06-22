"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await signIn("resend", { email, callbackUrl: "/feed", redirect: false })
    setLoading(false)
    setSent(true)
  }

  return (
    <div style={{
      minHeight: "100dvh", background: "#0A0D3A", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px 24px 40px", maxWidth: 428, margin: "0 auto",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: "linear-gradient(135deg, #5865F2, #7B4DFF, #EC48BD)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20"><polygon points="10,2 18,17 2,17" fill="white"/></svg>
        </div>
        <span style={{ fontFamily: "var(--font-space, system-ui)", fontWeight: 700, fontSize: 28, color: "#fff" }}>SocioN</span>
      </div>

      {sent ? (
        <div style={{
          width: "100%", padding: 28, borderRadius: 24,
          background: "rgba(88,101,242,0.15)", border: "1px solid rgba(88,101,242,0.3)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#fff", fontFamily: "var(--font-space, system-ui)" }}>Link enviado!</div>
          <div style={{ fontSize: 14, color: "#8B90A8", marginTop: 6 }}>Verifique <strong style={{ color: "#fff" }}>{email}</strong></div>
        </div>
      ) : (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div style={{ fontFamily: "var(--font-space, system-ui)", fontWeight: 700, fontSize: 28, color: "#fff", lineHeight: 1.2 }}>Acesse sua conta</div>
          </div>

          {/* LinkedIn (Google auth) */}
          <button onClick={() => signIn("google", { callbackUrl: "/feed" })} style={{
            width: "100%", height: 54, borderRadius: 14, border: "none", cursor: "pointer",
            background: "#5865F2",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            fontWeight: 600, fontSize: 16, color: "#fff",
            fontFamily: "var(--font-inter, system-ui)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            Entrar com LinkedIn
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: 14, color: "#8B90A8" }}>ou</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleMagicLink} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#E2E8F0" }}>E-mail</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" required
                style={{
                  height: 54, padding: "0 16px", fontSize: 16, color: "#fff",
                  background: "#1E2353", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12, outline: "none",
                }}
              />
            </div>
            <button type="submit" disabled={loading} style={{
              height: 54, borderRadius: 14, cursor: "pointer",
              background: "#1E2353", border: "1px solid rgba(255,255,255,0.1)",
              fontWeight: 600, fontSize: 16, color: "#fff", opacity: loading ? 0.5 : 1,
            }}>
              {loading ? "Enviando..." : "Entrar com Magic Link"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 8 }}>
            <span style={{ fontSize: 14, color: "#8B90A8" }}>Ainda não tenho conta. </span>
            <a href="/onboarding" style={{ fontSize: 14, fontWeight: 600, color: "#5865F2", textDecoration: "none" }}>Criar agora</a>
          </div>
        </div>
      )}
    </div>
  )
}
