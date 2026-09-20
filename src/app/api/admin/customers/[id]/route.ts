import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const customer = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          include: {
            items: { include: { product: { select: { name: true, images: true } } } },
          },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          include: { product: { select: { name: true, images: true } } },
        },
        addresses: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const totalSpent = customer.orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return NextResponse.json({
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.mobile,
        role: customer.role,
        isBlocked: customer.isBlocked,
        createdAt: customer.createdAt,
        totalOrders: customer.orders.length,
        totalSpent,
        addresses: customer.addresses,
        orders: customer.orders,
        reviews: customer.reviews,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/customers/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { isBlocked } = await request.json();

    if (typeof isBlocked !== "boolean") {
      return NextResponse.json({ error: "isBlocked must be a boolean" }, { status: 400 });
    }

    const customer = await prisma.user.findUnique({ where: { id: params.id } });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    if (customer.role === "ADMIN") {
      return NextResponse.json({ error: "Cannot block admin accounts" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { isBlocked },
    });

    await logAuditAction({
      action: isBlocked ? "CUSTOMER_BLOCKED" : "CUSTOMER_UNBLOCKED",
      entityType: "User",
      entityId: params.id,
      details: `Customer ${customer.email} was ${isBlocked ? "blocked" : "unblocked"}`,
      adminEmail: admin.email,
    });

    return NextResponse.json({ customer: updated });
  } catch (error) {
    console.error("PATCH /api/admin/customers/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
