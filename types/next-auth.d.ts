import { Plan } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      plan: Plan
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
