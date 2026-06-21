import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get("cursor")
  const limit = 10

  // Users already liked by current user
  const liked = await db.like.findMany({
    where: { senderId: session.user.id },
    select: { receiverId: true },
  })
  const likedIds = liked.map((l) => l.receiverId)

  const users = await db.user.findMany({
    where: {
      id: { notIn: [session.user.id, ...likedIds] },
      ...(cursor ? { id: { lt: cursor, notIn: [session.user.id, ...likedIds] } } : {}),
    },
    select: {
      id: true,
      name: true,
      image: true,
      headline: true,
      location: true,
      trustScore: true,
      availability: true,
      businessType: true,
      offeredRoles: true,
      skills: { take: 5, select: { name: true, category: true } },
    },
    orderBy: [{ trustScore: "desc" }, { id: "desc" }],
    take: limit + 1,
  })

  const hasMore = users.length > limit
  const items = hasMore ? users.slice(0, limit) : users
  const nextCursor = hasMore ? items[items.length - 1].id : null

  return NextResponse.json({ users: items, nextCursor })
}
