import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getActiveSubscriptionByEmail } from "@/lib/subscription";

export async function requireUser(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      user: null,
    };
  }
  return { error: null, user };
}

export async function requireActiveSubscription(req: NextRequest) {
  const auth = await requireUser(req);
  if (auth.error || !auth.user) return auth;
  const subscription = await getActiveSubscriptionByEmail(auth.user.email);
  if (!subscription) {
    return {
      error: NextResponse.json({ error: "Active subscription required" }, { status: 402 }),
      user: auth.user,
      subscription: null,
    };
  }
  return { error: null, user: auth.user, subscription };
}
