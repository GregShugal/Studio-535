import type { Request, Response } from "express";
import Stripe from "stripe";
import { handleStripeWebhook } from "../stripe-router";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-10-29.clover",
});

/**
 * Stripe webhook endpoint handler
 * This endpoint receives events from Stripe and processes them
 */
export async function stripeWebhookHandler(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Stripe Webhook] No signature header");
    return res.status(400).send("No signature");
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Process the event
    await handleStripeWebhook(event);
    res.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error processing event:", error);
    res.status(500).send("Webhook processing failed");
  }
}
