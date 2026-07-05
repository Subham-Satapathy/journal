import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getActiveSubscriptionByEmail } from "@/lib/subscription";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ user: null, subscription: null }, { status: 401 });
  }
  const subscription = await getActiveSubscriptionByEmail(user.email);
  return NextResponse.json({ user, subscription });
}
