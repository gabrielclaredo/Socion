import { db } from "@/lib/db"
import { NextResponse } from "next/server"

const updates = [
  { email: "teste@socion.app", image: "https://randomuser.me/api/portraits/men/32.jpg" },
  { email: "ana.rodrigues@socion.app", image: "https://randomuser.me/api/portraits/women/44.jpg" },
  { email: "lucas.ferreira@socion.app", image: "https://randomuser.me/api/portraits/men/52.jpg" },
  { email: "mariana.costa@socion.app", image: "https://randomuser.me/api/portraits/women/68.jpg" },
  { email: "pedro.alves@socion.app", image: "https://randomuser.me/api/portraits/men/41.jpg" },
  { email: "sofia.lima@socion.app", image: "https://randomuser.me/api/portraits/women/26.jpg" },
  { email: "rafael.santos@socion.app", image: "https://randomuser.me/api/portraits/men/77.jpg" },
  { email: "camila.vieira@socion.app", image: "https://randomuser.me/api/portraits/women/55.jpg" },
  { email: "thiago.mendes@socion.app", image: "https://randomuser.me/api/portraits/men/18.jpg" },
  { email: "julia.nascimento@socion.app", image: "https://randomuser.me/api/portraits/women/33.jpg" },
]

export async function GET() {
  const results = []
  for (const u of updates) {
    const r = await db.user.updateMany({ where: { email: u.email }, data: { image: u.image } })
    results.push({ email: u.email, updated: r.count })
  }
  return NextResponse.json({ ok: true, results })
}
