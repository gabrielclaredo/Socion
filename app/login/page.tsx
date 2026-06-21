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
    <div className="min-h-screen flex flex-col justify-center p-5 max-w-sm mx-auto" style={{ background: "var(--color-canvas)" }}>
      {/* Logo */}
      <div className="mb-10">
        <div className="w-12 h-12 rounded-[var(--rounded-md)] flex items-center justify-center mb-4"
          style={{ background: "var(--color-block-navy)" }}>
          <span className="font-extrabold text-2xl" style={{ color: "var(--color-block-lilac)", fontFamily: "var(--font-outfit)" }}>N</span>
        </div>
        <h1 className="font-bold text-3xl" style={{ color: "var(--color-ink)", letterSpacing: "-0.5px" }}>
          Bem-vindo ao SocioN
        </h1>
        <p className="text-base mt-2" style={{ color: "rgba(0,0,0,0.5)" }}>
          Encontre seu co-fundador ideal.
        </p>
      </div>

      {sent ? (
        <div className="p-6 rounded-[var(--rounded-lg)] text-center" style={{ background: "var(--color-block-lilac)" }}>
          <div className="text-4xl mb-3">📬</div>
          <h2 className="font-bold text-lg" style={{ color: "var(--color-block-navy)" }}>Link enviado!</h2>
          <p className="text-sm mt-1" style={{ color: "rgba(31,29,61,0.65)" }}>
            Verifique seu e-mail <strong>{email}</strong> para entrar.
          </p>
        </div>
      ) : (
        <>
          <form onSubmit={handleMagicLink} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(0,0,0,0.4)" }}>
                E-mail profissional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full text-sm outline-none px-4 py-3"
                style={{
                  background: "var(--color-surface-soft)",
                  border: "1px solid var(--color-hairline)",
                  borderRadius: "var(--rounded-md)",
                  color: "var(--color-ink)",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 font-semibold text-sm transition-opacity disabled:opacity-50"
              style={{ background: "var(--color-primary)", color: "var(--color-canvas)", borderRadius: "var(--rounded-pill)" }}
            >
              {loading ? "Enviando..." : "Entrar com Magic Link"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "var(--color-hairline)" }} />
            <span className="text-xs" style={{ color: "rgba(0,0,0,0.35)" }}>ou continue com</span>
            <div className="flex-1 h-px" style={{ background: "var(--color-hairline)" }} />
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/feed" })}
            className="w-full flex items-center justify-center gap-3 py-3.5 font-medium text-sm transition-colors"
            style={{
              background: "var(--color-canvas)",
              border: "1px solid var(--color-hairline)",
              borderRadius: "var(--rounded-pill)",
              color: "var(--color-ink)",
            }}
          >
            <div className="w-5 h-5 rounded flex items-center justify-center text-white font-bold text-xs"
              style={{ background: "#4285F4" }}>G</div>
            Continuar com Google
          </button>
        </>
      )}

      <p className="text-center text-xs mt-8" style={{ color: "rgba(0,0,0,0.4)" }}>
        Não tem conta?{" "}
        <a href="/onboarding" className="font-semibold" style={{ color: "var(--color-ink)", textDecoration: "underline" }}>
          Criar conta grátis
        </a>
      </p>
    </div>
  )
}
