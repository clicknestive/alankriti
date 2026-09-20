"use client";

import { useEffect, useState } from "react";
import { formatPrice, parseProductImages } from "@/lib/utils";
import {
  Package,
  ShoppingBag,
  Users,
  IndianRupee,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  lowStockProducts: number;
  monthlySales: { month: string; revenue: number; orders: number }[];
  categoryPerformance: { name: string; totalRevenue: number; totalSold: number }[];
  popularProducts: { name?: string; productName?: string; images?: any; productImage?: any; totalSold?: number; _sum?: { quantity?: number; total?: number } }[];
  recentActivity: { id: string; action: string; details: string; adminEmail: string; createdAt: string }[];
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-[#E8E0D5] shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#5E7052] text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
          <p className="text-[#1C241D] text-2xl font-semibold">{value}</p>
          {sub && <p className="text-[#826530] text-xs mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function MiniBarChart({ data }: { data: { month: string; revenue: number }[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const last6 = data.slice(-6);
  return (
    <div className="flex items-end gap-2 h-28">
      {last6.map((d) => (
        <div key={d.month} className="flex flex-col items-center flex-1 gap-1">
          <div
            className="w-full rounded-t-md bg-[#A8B89A] hover:bg-[#C6A15B] transition-colors"
            style={{ height: `${Math.max((d.revenue / max) * 96, 4)}px` }}
            title={`${d.month}: ${formatPrice(d.revenue)}`}
          />
          <span className="text-[#5E7052] text-xs">{d.month.slice(0, 3)}</span>
        </div>
      ))}
    </div>
  );
}

function actionColor(action: string) {
  if (action.includes("DELETE") || action.includes("BLOCKED")) return "bg-red-100 text-red-700";
  if (action.includes("CREATE") || action.includes("APPROVED") || action.includes("UNBLOCKED")) return "bg-green-100 text-green-700";
  if (action.includes("UPDATE") || action.includes("STOCK") || action.includes("STATUS")) return "bg-blue-100 text-blue-700";
  if (action.includes("LOGIN")) return "bg-purple-100 text-purple-700";
  return "bg-gray-100 text-gray-700";
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.metrics) {
          setData({
            ...d.metrics,
            monthlySales: d.charts?.monthlySales || [],
            categoryPerformance: d.charts?.categoryPerformance || [],
            popularProducts: d.charts?.popularItems || [],
            recentActivity: d.recentAuditLogs || [],
          });
        } else {
          setData(d);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#C6A15B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-red-500">Failed to load dashboard data.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total Products" value={data.totalProducts} color="bg-[#5E7052]" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={data.totalOrders} color="bg-[#826530]" />
        <StatCard icon={Users} label="Customers" value={data.totalCustomers} color="bg-[#43513B]" />
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={formatPrice(data.totalRevenue)}
          color="bg-[#C6A15B]"
        />
      </div>

      {/* Order status row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Pending"
          value={data.pendingOrders}
          color="bg-amber-500"
        />
        <StatCard
          icon={Truck}
          label="Processing"
          value={data.processingOrders}
          color="bg-blue-500"
        />
        <StatCard
          icon={CheckCircle}
          label="Delivered"
          value={data.deliveredOrders}
          color="bg-emerald-500"
        />
        <StatCard
          icon={XCircle}
          label="Cancelled"
          value={data.cancelledOrders}
          color="bg-red-500"
        />
      </div>

      {/* Low stock alert */}
      {data.lowStockProducts > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle className="text-amber-600 shrink-0" size={18} />
          <span className="text-amber-800 text-sm">
            <strong>{data.lowStockProducts}</strong> product{data.lowStockProducts !== 1 ? "s" : ""} have low stock (≤5 units).{" "}
            <a href="/admin/inventory" className="underline hover:no-underline">Review inventory →</a>
          </span>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly sales chart */}
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D5] shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-[#C6A15B]" size={18} />
            <h3 className="text-[#1C241D] font-medium text-sm">Monthly Revenue</h3>
          </div>
          <MiniBarChart data={data.monthlySales} />
        </div>

        {/* Category performance */}
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D5] shadow-sm">
          <h3 className="text-[#1C241D] font-medium text-sm mb-4">Category Performance</h3>
          <div className="space-y-2.5">
            {data.categoryPerformance.slice(0, 5).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <span className="text-[#43513B] truncate max-w-[120px]">{cat.name}</span>
                <div className="flex gap-4 text-right">
                  <span className="text-[#5E7052] text-xs">{cat.totalSold} sold</span>
                  <span className="text-[#826530] font-medium w-20">{formatPrice(cat.totalRevenue)}</span>
                </div>
              </div>
            ))}
            {data.categoryPerformance.length === 0 && (
              <p className="text-[#5E7052] text-sm">No sales data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Popular products */}
      <div className="bg-white rounded-xl p-5 border border-[#E8E0D5] shadow-sm">
        <h3 className="text-[#1C241D] font-medium text-sm mb-4">Top Selling Products</h3>
        {data.popularProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {data.popularProducts.map((p, idx) => {
              const displayName = p.name || p.productName || "Product";
              const imgs = parseProductImages(p.images || p.productImage);
              const soldCount = p.totalSold ?? p._sum?.quantity ?? 0;
              return (
                <div key={displayName + idx} className="flex flex-col items-center text-center gap-2">
                  <div className="w-16 h-16 rounded-xl bg-[#F8F1E7] overflow-hidden">
                    {imgs[0] ? (
                      <img src={imgs[0]} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="text-[#A8B89A]" size={24} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[#1C241D] text-xs font-medium leading-tight line-clamp-2">{displayName}</p>
                    <p className="text-[#5E7052] text-xs">{soldCount} sold</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[#5E7052] text-sm">No sales yet.</p>
        )}
      </div>

      {/* Recent audit activity */}
      <div className="bg-white rounded-xl p-5 border border-[#E8E0D5] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#1C241D] font-medium text-sm">Recent Admin Activity</h3>
          <a href="/admin/audit-logs" className="text-[#C6A15B] text-xs hover:underline">View all →</a>
        </div>
        <div className="space-y-2.5">
          {data.recentActivity.map((log) => (
            <div key={log.id} className="flex items-start gap-3 text-sm">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${actionColor(log.action)}`}>
                {log.action}
              </span>
              <span className="text-[#43513B] flex-1 text-xs leading-relaxed">{log.details}</span>
              <span className="text-[#5E7052] text-xs shrink-0">
                {new Date(log.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            </div>
          ))}
          {data.recentActivity.length === 0 && (
            <p className="text-[#5E7052] text-sm">No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  );
}
