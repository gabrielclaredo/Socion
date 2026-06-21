import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const partnerships = await db.partnership.findMany({
    where: {
      OR: [{ userAId: session.user.id }, { userBId: session.user.id }],
    },
    include: {
      userA: { select: { id: true, name: true, image: true, headline: true, trustScore: true } },
      userB: { select: { id: true, name: true, image: true, headline: true, trustScore: true } },
      proposals: { orderBy: { createdAt: "desc" }, take: 1 },
      timeline: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(partnerships)
}
