import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveSubscription } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireActiveSubscription(req);
    if (auth.error || !auth.user) return auth.error!;

    const { id } = await params;
    const body = await req.json();
    const result = await prisma.trade.updateMany({
      where: { id, userId: auth.user.id },
      data: {
        ...body,
        date: body.date ? new Date(body.date) : undefined,
        closeDate: body.closeDate ? new Date(body.closeDate) : undefined,
      },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }
    const trade = await prisma.trade.findFirst({ where: { id, userId: auth.user.id } });
    return NextResponse.json(trade);
  } catch (error) {
    console.error("PATCH /api/trades/[id] error:", error);
    return NextResponse.json({ error: "Failed to update trade" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireActiveSubscription(req);
    if (auth.error || !auth.user) return auth.error!;

    const { id } = await params;
    const deleted = await prisma.trade.deleteMany({ where: { id, userId: auth.user.id } });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, deleted: deleted.count });
  } catch (error) {
    console.error("DELETE /api/trades/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete trade" }, { status: 500 });
  }
}
