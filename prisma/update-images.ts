import { config } from "dotenv"
config({ path: ".env.local" })

// Override DATABASE_URL to remove channel_binding for local execution
process.env.DATABASE_URL = process.env.DATABASE_URL?.replace("&channel_binding=require", "") ?? ""

import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

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

async function main() {
  for (const u of updates) {
    const updated = await db.user.updateMany({ where: { email: u.email }, data: { image: u.image } })
    console.log(`✅ ${u.email} → ${updated.count} updated`)
  }
}

main().catch(console.error).finally(() => db.$disconnect())
