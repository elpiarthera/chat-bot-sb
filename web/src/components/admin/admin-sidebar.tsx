"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname?.startsWith(path) ? "bg-accent-background text-accent" : "";
  };

  const navItems = [
    { name: "Dashboard", path: "/admin" },
    { name: "Bots", path: "/admin/bots" },
    { name: "Assistants", path: "/admin/assistants" },
    { name: "Embeddings", path: "/admin/embeddings" },
    { name: "Tools", path: "/admin/tools" },
    { name: "Configuration", path: "/admin/configuration" },
  ];

  return (
    <div className="w-64 bg-background border-r border-border h-full overflow-y-auto">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-6">Admin Panel</h1>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent-background/50 ${isActive(
                item.path
              )}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}