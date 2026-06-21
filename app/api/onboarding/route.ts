import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { calculateTrustScore } from "@/lib/trust-engine"
import { z } from "zod"

const schema = z.object({
  headline: z.string().min(1),
  availability: z.string(),
  investmentRange: z.string(),
  businessType: z.array(z.string()),
  desiredRoles: z.array(z.string()),
  offeredRoles: z.array(z.string()),
  values: z.array(z.object({ question: z.string(), answer: z.string() })),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const data = schema.parse(body)

  await db.user.update({
    where: { id: session.user.id },
    data: {
      headline: data.headline,
      availability: data.availability,
      investmentRange: data.investmentRange,
      businessType: data.businessType,
      desiredRoles: data.desiredRoles,
      offeredRoles: data.offeredRoles,
    },
  })

  if (data.values.length > 0) {
    await db.userValue.deleteMany({ where: { userId: session.user.id } })
    await db.userValue.createMany({
      data: data.values.map((v) => ({ userId: session.user.id!, ...v })),
    })
  }

  await calculateTrustScore(session.user.id)

  return NextResponse.json({ success: true })
}
