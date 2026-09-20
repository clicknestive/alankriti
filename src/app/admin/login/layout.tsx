import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | Alankriti Couture",
  robots: "noindex, nofollow",
};

// Parent admin layout provides AdminAuthProvider + AdminLayoutClient.
// AdminLayoutClient detects /admin/login and skips sidebar rendering.
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
