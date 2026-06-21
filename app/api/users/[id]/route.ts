import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, image: true, headline: true, location: true,
      trustScore: true, identityScore: true, experienceScore: true,
      competenceScore: true, reputationScore: true, commitmentScore: true, compatibilityScore: true,
      availability: true, investmentRange: true, businessType: true,
      desiredRoles: true, offeredRoles: true, verificationStatus: true,
      linkedinData: true, createdAt: true,
      skills: true,
      projects: true,
      values: true,
    },
  })

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Common connections count (liked same people)
  const myLikes = await db.like.findMany({ where: { senderId: session.user.id }, select: { receiverId: true } })
  const theirLikes = await db.like.findMany({ where: { senderId: id }, select: { receiverId: true } })
  const mySet = new Set(myLikes.map((l) => l.receiverId))
  const commonConnections = theirLikes.filter((l) => mySet.has(l.receiverId)).length

  return NextResponse.json({ ...user, commonConnections })
}
