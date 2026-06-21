import { db } from "@/lib/db"

export async function calculateTrustScore(userId: string): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { skills: true, projects: true, values: true, documents: true },
  })
  if (!user) return

  // Identity (20%) — based on verification status
  const identityScore =
    user.verificationStatus === "VERIFIED" ? 100 :
    user.verificationStatus === "PENDING" && user.documents.length > 0 ? 40 : 10

  // Experience (20%) — LinkedIn data + projects
  const hasLinkedin = !!user.linkedinData
  const projectCount = user.projects.length
  const experienceScore = Math.min(100,
    (hasLinkedin ? 40 : 0) +
    Math.min(60, projectCount * 15)
  )

  // Competence (20%) — validated skills
  const validatedSkills = user.skills.filter((s) => s.validated).length
  const totalSkills = user.skills.length
  const competenceScore = totalSkills === 0 ? 0 :
    Math.min(100, 40 + Math.round((validatedSkills / totalSkills) * 60))

  // Reputation (20%) — completeness of profile
  let reputationScore = 0
  if (user.name) reputationScore += 10
  if (user.headline) reputationScore += 15
  if (user.image) reputationScore += 10
  if (user.availability) reputationScore += 10
  if (user.businessType.length > 0) reputationScore += 15
  if (user.desiredRoles.length > 0) reputationScore += 15
  if (user.offeredRoles.length > 0) reputationScore += 15
  if (user.values.length >= 3) reputationScore += 10

  // Commitment (20%) — profile filled + activity
  const commitmentScore = Math.min(100,
    (user.linkedinData ? 30 : 0) +
    (user.skills.length >= 3 ? 20 : user.skills.length * 5) +
    (user.projects.length >= 2 ? 30 : user.projects.length * 10) +
    (user.values.length >= 3 ? 20 : user.values.length * 5)
  )

  // Compatibility (20%) — preferences filled
  const compatibilityScore = Math.min(100,
    (user.businessType.length > 0 ? 30 : 0) +
    (user.desiredRoles.length > 0 ? 30 : 0) +
    (user.investmentRange ? 20 : 0) +
    (user.availability ? 20 : 0)
  )

  const trustScore = Math.round(
    identityScore * 0.2 +
    experienceScore * 0.2 +
    competenceScore * 0.2 +
    reputationScore * 0.2 +
    commitmentScore * 0.2
  )

  await db.user.update({
    where: { id: userId },
    data: {
      trustScore,
      identityScore,
      experienceScore,
      competenceScore,
      reputationScore,
      commitmentScore,
      compatibilityScore,
    },
  })
}
