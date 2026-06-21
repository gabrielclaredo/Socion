import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { receiverId } = await req.json()
  if (!receiverId) return NextResponse.json({ error: "Missing receiverId" }, { status: 400 })

  // Create like
  await db.like.upsert({
    where: { senderId_receiverId: { senderId: session.user.id, receiverId } },
    update: {},
    create: { senderId: session.user.id, receiverId },
  })

  // Check for mutual like (match)
  const mutualLike = await db.like.findUnique({
    where: { senderId_receiverId: { senderId: receiverId, receiverId: session.user.id } },
  })

  let match = null
  if (mutualLike) {
    const [userAId, userBId] = [session.user.id, receiverId].sort()
    match = await db.partnership.upsert({
      where: { userAId_userBId: { userAId, userBId } },
      update: {},
      create: {
        userAId,
        userBId,
        status: "matched",
        timeline: {
          create: [
            { title: "É um Match! 🎉", description: "Vocês dois se curtiram", completed: true, completedAt: new Date() },
            { title: "Inicie uma conversa", description: "Envie uma proposta de sociedade" },
            { title: "Proposta enviada", description: "Detalhe os termos da parceria" },
            { title: "Contrato em elaboração", description: "Formalize a sociedade" },
            { title: "Contrato assinado", description: "Sociedade iniciada!" },
          ],
        },
      },
    })
  }

  return NextResponse.json({ liked: true, match: !!match, matchId: match?.id })
}
