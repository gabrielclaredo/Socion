import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { calculateTrustScore } from "@/lib/trust-engine"
import { z } from "zod"

const schema = z.object({
  name: z.string().optional(),
  headline: z.string().optional(),
  location: z.string().optional(),
  availability: z.string().optional(),
  investmentRange: z.string().optional(),
  businessType: z.array(z.string()).optional(),
  desiredRoles: z.array(z.string()).optional(),
  offeredRoles: z.array(z.string()).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { skills: true, projects: true, values: true },
  })
  return NextResponse.json(user)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const data = schema.parse(body)

  await db.user.update({ where: { id: session.user.id }, data })
  await calculateTrustScore(session.user.id)

  return NextResponse.json({ success: true })
}
