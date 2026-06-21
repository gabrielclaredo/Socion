import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { status } = await req.json()

  const proposal = await db.proposal.findUnique({ where: { id } })
  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (proposal.receiverId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const updated = await db.proposal.update({ where: { id }, data: { status } })

  if (status === "accepted") {
    await db.timelineEvent.updateMany({
      where: { partnershipId: proposal.partnershipId, title: "Contrato em elaboração" },
      data: { completed: true, completedAt: new Date() },
    })
  }

  return NextResponse.json(updated)
}
