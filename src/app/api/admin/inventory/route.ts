import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "all"; // all | in-stock | low-stock | out-of-stock
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.name = { contains: search };
  }

  if (filter === "out-of-stock") {
    where.stock = 0;
  } else if (filter === "low-stock") {
    where.stock = { gt: 0, lte: 5 };
  } else if (filter === "in-stock") {
    where.stock = { gt: 5 };
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { stock: "asc" },
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      isActive: true,
      price: true,
      images: true,
      category: { select: { name: true } },
    },
  });

  const inStock = products.filter((p) => p.stock > 5).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  return NextResponse.json({
    products,
    summary: { inStock, lowStock, outOfStock, total: products.length },
  });
}

export async function PATCH(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, stock } = await request.json();
    if (!id || typeof stock !== "number") {
      return NextResponse.json({ error: "id and stock (number) are required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const oldStock = product.stock;
    const isActive = stock > 0 ? product.isActive : false;

    const updated = await prisma.product.update({
      where: { id },
      data: { stock, isActive },
    });

    await logAuditAction({
      action: "STOCK_UPDATED",
      entityType: "Product",
      entityId: id,
      details: `Stock for "${product.name}" updated from ${oldStock} to ${stock}${stock === 0 ? " (auto-deactivated)" : ""}`,
      adminEmail: admin.email,
    });

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error("PATCH /api/admin/inventory:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
