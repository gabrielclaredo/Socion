import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  partnershipId: z.string(),
  receiverId: z.string(),
  equity: z.number().min(1).max(99),
  role: z.string().min(1),
  investmentType: z.string().min(1),
  message: z.string().min(10),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const data = schema.parse(body)

  const proposal = await db.proposal.create({
    data: { ...data, senderId: session.user.id },
  })

  // Advance timeline
  await db.timelineEvent.updateMany({
    where: { partnershipId: data.partnershipId, title: "Inicie uma conversa" },
    data: { completed: true, completedAt: new Date() },
  })
  await db.timelineEvent.updateMany({
    where: { partnershipId: data.partnershipId, title: "Proposta enviada" },
    data: { completed: true, completedAt: new Date() },
  })

  return NextResponse.json(proposal)
}
