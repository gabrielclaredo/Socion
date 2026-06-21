"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, ChevronLeft } from "lucide-react"

const ROLES = ["Tecnologia", "Marketing", "Produto", "Vendas", "Operações", "Finanças", "Jurídico", "Design"]
const BUSINESS_TYPES = ["SaaS", "Marketplace", "IA", "E-commerce", "Agência", "Serviços", "Healthtech", "Edtech"]
const AVAILABILITY = ["10h/semana", "20h/semana", "40h/semana (Full Time)"]
const INVESTMENT = ["Sem investimento", "Até R$ 10k", "Até R$ 50k", "Acima de R$ 50k"]
const VALUES_QUESTIONS = [
  { q: "Velocidade ou perfeição?", a: ["Velocidade", "Perfeição"] },
  { q: "Risco ou estabilidade?", a: ["Risco", "Estabilidade"] },
  { q: "Crescimento ou lucro?", a: ["Crescimento", "Lucro"] },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    headline: "",
    availability: "",
    investmentRange: "",
    businessType: [] as string[],
    desiredRoles: [] as string[],
    offeredRoles: [] as string[],
    values: [] as { question: string; answer: string }[],
  })

  function toggle(key: "businessType" | "desiredRoles" | "offeredRoles", value: string) {
    setData((d) => ({
      ...d,
      [key]: d[key].includes(value) ? d[key].filter((v) => v !== value) : [...d[key], value],
    }))
  }

  function setValueAnswer(question: string, answer: string) {
    setData((d) => ({
      ...d,
      values: [
        ...d.values.filter((v) => v.question !== question),
        { question, answer },
      ],
    }))
  }

  async function handleFinish() {
    setLoading(true)
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    router.push("/feed")
  }

  const steps = [
    // Step 0 — Headline
    <div key="0" className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1F2937] font-outfit">Quem é você?</h2>
        <p className="text-[#6B7280] text-sm mt-1">Uma frase que define seu perfil profissional</p>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#374151] uppercase tracking-wide">Seu headline</label>
        <input
          value={data.headline}
          onChange={(e) => setData((d) => ({ ...d, headline: e.target.value }))}
          placeholder="Ex: CTO buscando co-fundador de negócios"
          className="border border-[#7B61FF] rounded-lg px-4 py-3 text-sm text-[#1F2937] outline-none focus:ring-2 focus:ring-[#7B61FF]/20"
        />
      </div>
    </div>,

    // Step 1 — O que você busca
    <div key="1" className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1F2937] font-outfit">O que você busca?</h2>
        <p className="text-[#6B7280] text-sm mt-1">Perfil que você quer como sócio</p>
      </div>
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-[#374151] uppercase tracking-wide">Área desejada</label>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button key={r} onClick={() => toggle("desiredRoles", r)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${data.desiredRoles.includes(r) ? "bg-[#7B61FF] text-white border-[#7B61FF]" : "bg-white text-[#374151] border-[#E5E7EB]"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-[#374151] uppercase tracking-wide">Tipo de negócio</label>
        <div className="flex flex-wrap gap-2">
          {BUSINESS_TYPES.map((b) => (
            <button key={b} onClick={() => toggle("businessType", b)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${data.businessType.includes(b) ? "bg-[#FF6B35] text-white border-[#FF6B35]" : "bg-white text-[#374151] border-[#E5E7EB]"}`}>
              {b}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 2 — O que você oferece
    <div key="2" className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1F2937] font-outfit">O que você oferece?</h2>
        <p className="text-[#6B7280] text-sm mt-1">Sua área de atuação principal</p>
      </div>
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-[#374151] uppercase tracking-wide">Suas habilidades</label>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button key={r} onClick={() => toggle("offeredRoles", r)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${data.offeredRoles.includes(r) ? "bg-[#7B61FF] text-white border-[#7B61FF]" : "bg-white text-[#374151] border-[#E5E7EB]"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-[#374151] uppercase tracking-wide">Disponibilidade</label>
        <div className="flex flex-col gap-2">
          {AVAILABILITY.map((a) => (
            <button key={a} onClick={() => setData((d) => ({ ...d, availability: a }))}
              className={`px-4 py-3 rounded-xl text-sm font-medium border text-left transition-all ${data.availability === a ? "bg-[#7B61FF] text-white border-[#7B61FF]" : "bg-white text-[#374151] border-[#E5E7EB]"}`}>
              {a}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-[#374151] uppercase tracking-wide">Faixa de investimento</label>
        <div className="flex flex-col gap-2">
          {INVESTMENT.map((i) => (
            <button key={i} onClick={() => setData((d) => ({ ...d, investmentRange: i }))}
              className={`px-4 py-3 rounded-xl text-sm font-medium border text-left transition-all ${data.investmentRange === i ? "bg-[#FF6B35] text-white border-[#FF6B35]" : "bg-white text-[#374151] border-[#E5E7EB]"}`}>
              {i}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 3 — Valores
    <div key="3" className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1F2937] font-outfit">Quiz de Compatibilidade</h2>
        <p className="text-[#6B7280] text-sm mt-1">Suas respostas ajudam a calcular seu Score</p>
      </div>
      {VALUES_QUESTIONS.map(({ q, a }) => {
        const selected = data.values.find((v) => v.question === q)?.answer
        return (
          <div key={q} className="flex flex-col gap-3">
            <p className="font-semibold text-[#1F2937] text-sm">{q}</p>
            <div className="flex gap-3">
              {a.map((opt) => (
                <button key={opt} onClick={() => setValueAnswer(q, opt)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${selected === opt ? "bg-[#7B61FF] text-white border-[#7B61FF]" : "bg-white text-[#374151] border-[#E5E7EB]"}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>,
  ]

  const canNext = [
    data.headline.length > 3,
    data.desiredRoles.length > 0,
    data.offeredRoles.length > 0 && !!data.availability,
    data.values.length >= VALUES_QUESTIONS.length,
  ]

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col max-w-sm mx-auto">
      {/* Progress bar */}
      <div className="h-1.5 bg-[#E5E7EB]">
        <div
          className="h-full bg-[#7B61FF] transition-all"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <p className="text-xs text-[#9CA3AF] mb-6">Passo {step + 1} de {steps.length}</p>
        {steps[step]}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto bg-[#FFFBF5] border-t border-[#E5E7EB] p-4 flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)}
            className="flex items-center justify-center w-12 h-12 rounded-xl border border-[#E5E7EB] text-[#374151]">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {step < steps.length - 1 ? (
          <button onClick={() => setStep((s) => s + 1)} disabled={!canNext[step]}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#7B61FF] text-white font-semibold rounded-xl disabled:opacity-40 transition-opacity">
            Próximo <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleFinish} disabled={!canNext[step] || loading}
            className="flex-1 py-3 bg-[#FF6B35] text-white font-semibold rounded-xl disabled:opacity-40 transition-opacity">
            {loading ? "Salvando..." : "Começar a explorar 🚀"}
          </button>
        )}
      </div>
    </div>
  )
}
