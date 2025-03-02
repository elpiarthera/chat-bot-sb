import React from "react";
import dynamic from "next/dynamic";

// Import AdminSidebar as a client component
const AdminSidebar = dynamic(() => import("./admin-sidebar").then(mod => ({ default: mod.AdminSidebar })), { ssr: false });

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // You can add any data fetching or authentication logic here

  return (
    <div className="flex h-dvh">
      {/* Admin sidebar */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex-1 overflow-auto p-6">{children}</div>
    </div>
  );
} 