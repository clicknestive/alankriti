"use client";

import { useAdminAuth } from "@/context/AdminAuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Users,
  Star,
  Warehouse,
  ScrollText,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
];

function AdminSidebarContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  const { admin, adminLogout } = useAdminAuth();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#2A3425] flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#C6A15B]/60 bg-[#FAF6F0] shrink-0">
          <Image
            src="/images/logo.png"
            alt="Alankriti Logo"
            fill
            className="object-contain"
          />
        </div>
        <div>
          <div className="text-[#C6A15B] font-semibold text-sm tracking-widest uppercase">
            Alankriti
          </div>
          <div className="text-[#FAF6F0] font-light text-xs tracking-widest mt-0.5">
            Admin Console
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-all duration-150 group ${
                isActive
                  ? "bg-[#C6A15B] text-[#1C241D] font-medium"
                  : "text-[#BDCFB1] hover:bg-[#2A3425] hover:text-[#FAF6F0]"
              }`}
            >
              <Icon size={16} className="shrink-0" />
              <span>{label}</span>
              {isActive && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Admin info + Logout */}
      <div className="px-4 py-4 border-t border-[#2A3425]">
        <div className="mb-3">
          <div className="text-[#FAF6F0] text-sm font-medium truncate">{admin?.name}</div>
          <div className="text-[#5E7052] text-xs truncate">{admin?.email}</div>
        </div>
        <button
          onClick={adminLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[#BDCFB1] hover:bg-[#2A3425] hover:text-red-400 transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoginPage && !loading && !admin) {
      router.replace("/admin/login");
    }
  }, [admin, loading, router, isLoginPage]);

  // Login page renders without sidebar or auth guard
  if (isLoginPage) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#C6A15B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#5E7052] text-sm">Loading admin console…</p>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  // Page title from nav
  const currentNav = NAV_ITEMS.find(
    (n) => pathname === n.href || pathname.startsWith(n.href + "/")
  );
  const pageTitle = currentNav?.label || "Admin";

  return (
    <div className="flex h-screen bg-[#FAF6F0] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#1C241D] shrink-0">
        <AdminSidebarContent pathname={pathname} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-60 h-full bg-[#1C241D]">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-[#BDCFB1] hover:text-white"
            >
              <X size={20} />
            </button>
            <AdminSidebarContent pathname={pathname} onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-[#E8E0D5] flex items-center px-4 gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[#43513B] hover:text-[#1C241D]"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-[#1C241D] font-medium text-base">{pageTitle}</h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs text-[#5E7052] bg-[#F8F1E7] px-2 py-1 rounded border border-[#A8B89A]">
              ADMIN
            </span>
            <span className="text-sm text-[#43513B] font-medium">{admin.name}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
