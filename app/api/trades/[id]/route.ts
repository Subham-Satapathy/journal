import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const trade = await prisma.trade.update({
      where: { id },
      data: {
        ...body,
        date: body.date ? new Date(body.date) : undefined,
        closeDate: body.closeDate ? new Date(body.closeDate) : undefined,
      },
    });
    return NextResponse.json(trade);
  } catch (error) {
    console.error("PATCH /api/trades/[id] error:", error);
    return NextResponse.json({ error: "Failed to update trade" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.trade.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/trades/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete trade" }, { status: 500 });
  }
}
