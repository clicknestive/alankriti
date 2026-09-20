import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const filter = searchParams.get("filter") || "all"; // all | pending | approved | flagged
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = {};
  if (filter === "pending") where.isApproved = false;
  else if (filter === "approved") where.isApproved = true;
  else if (filter === "flagged") where.isFlagged = true;

  if (search) {
    where.OR = [
      { comment: { contains: search } },
      { user: { name: { contains: search } } },
      { user: { email: { contains: search } } },
      { product: { name: { contains: search } } },
    ];
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, images: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({ reviews, total, page, limit, totalPages: Math.ceil(total / limit) });
}

export async function PATCH(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, action } = await request.json();
    if (!id || !action) {
      return NextResponse.json({ error: "id and action are required" }, { status: 400 });
    }

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    let update: Record<string, unknown> = {};
    let auditAction = "";

    if (action === "approve") {
      update = { isApproved: true, isFlagged: false };
      auditAction = "REVIEW_APPROVED";
    } else if (action === "hide") {
      update = { isApproved: false };
      auditAction = "REVIEW_HIDDEN";
    } else if (action === "flag") {
      update = { isFlagged: true };
      auditAction = "REVIEW_FLAGGED";
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = await prisma.review.update({ where: { id }, data: update });

    await logAuditAction({
      action: auditAction,
      entityType: "Review",
      entityId: id,
      details: `Review ${id} was ${action}d`,
      adminEmail: admin.email,
    });

    return NextResponse.json({ review: updated });
  } catch (error) {
    console.error("PATCH /api/admin/reviews:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    await prisma.review.delete({ where: { id } });

    await logAuditAction({
      action: "REVIEW_DELETED",
      entityType: "Review",
      entityId: id,
      details: `Review ${id} was permanently deleted`,
      adminEmail: admin.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/reviews:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
