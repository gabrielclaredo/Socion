import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import Stripe from "stripe"

async function getPeriodEndFromSub(sub: Stripe.Subscription): Promise<Date | null> {
  if (!sub.latest_invoice) return null
  const invoiceId =
    typeof sub.latest_invoice === "string" ? sub.latest_invoice : sub.latest_invoice.id
  const invoice = await stripe.invoices.retrieve(invoiceId)
  return new Date(invoice.period_end * 1000)
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      if (!userId || !session.subscription || !session.customer) break
      const sub = await stripe.subscriptions.retrieve(session.subscription as string, {
        expand: ["latest_invoice"],
      })
      const periodEnd = await getPeriodEndFromSub(sub)
      await db.user.update({
        where: { id: userId },
        data: {
          plan: "PRO",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: sub.id,
          stripePriceId: sub.items.data[0].price.id,
          stripeCurrentPeriodEnd: periodEnd,
        },
      })
      break
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice
      const subId = (invoice as { subscription?: string }).subscription
      if (!subId) break
      await db.user.update({
        where: { stripeSubscriptionId: subId },
        data: { stripeCurrentPeriodEnd: new Date(invoice.period_end * 1000) },
      })
      break
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription
      const periodEnd = await getPeriodEndFromSub(sub)
      await db.user.update({
        where: { stripeSubscriptionId: sub.id },
        data: {
          stripePriceId: sub.items.data[0].price.id,
          stripeCurrentPeriodEnd: periodEnd,
        },
      })
      break
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      await db.user.update({
        where: { stripeSubscriptionId: sub.id },
        data: { plan: "FREE", stripeSubscriptionId: null, stripeCurrentPeriodEnd: null },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
