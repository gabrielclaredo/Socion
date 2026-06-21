import type { User } from "@prisma/client"

export function isTrialActive(user: User): boolean {
  return user.plan === "TRIAL" && !!user.trialEndsAt && user.trialEndsAt > new Date()
}

export function isSubscribed(user: User): boolean {
  return (
    user.plan === "PRO" &&
    !!user.stripeCurrentPeriodEnd &&
    user.stripeCurrentPeriodEnd > new Date()
  )
}

export function hasAccess(user: User): boolean {
  return isTrialActive(user) || isSubscribed(user)
}

export function daysLeftInTrial(user: User): number {
  if (!user.trialEndsAt) return 0
  const diff = user.trialEndsAt.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export const PLAN_LIMITS = {
  FREE: { likes: 5, matches: 2, proposals: 1 },
  TRIAL: { likes: Infinity, matches: Infinity, proposals: Infinity },
  PRO: { likes: Infinity, matches: Infinity, proposals: Infinity },
}
