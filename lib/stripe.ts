import "server-only";

import Stripe from "stripe";

export function stripeSecretKey() {
  if (process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY) {
    return process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY;
  } else throw new Error("stripe not defined");
}
export const stripe = new Stripe(stripeSecretKey(), {
  apiVersion: "2022-11-15; custom_checkout_beta=v1" as any,
});
