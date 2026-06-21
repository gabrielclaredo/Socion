import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const partnership = await db.partnership.findUnique({
    where: { id },
    include: {
      userA: { select: { id: true, name: true, image: true, headline: true, trustScore: true, offeredRoles: true } },
      userB: { select: { id: true, name: true, image: true, headline: true, trustScore: true, offeredRoles: true } },
      proposals: { orderBy: { createdAt: "desc" } },
      timeline: { orderBy: { createdAt: "asc" } },
    },
  })

  if (!partnership) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const isMember = partnership.userAId === session.user.id || partnership.userBId === session.user.id
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  return NextResponse.json(partnership)
}
