"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useI18n } from "@/hooks/useI18n";
import {
  LayoutDashboard,
  BarChart2,
  Package,
  ShoppingCart,
  Zap,
  Link2,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
} from "lucide-react";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    labelKey: "nav.dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: "/dashboard/analytics",
    labelKey: "nav.analytics",
    icon: <BarChart2 className="h-5 w-5" />,
  },
  {
    href: "/dashboard/products",
    labelKey: "nav.products",
    icon: <Package className="h-5 w-5" />,
  },
  {
    href: "/dashboard/orders",
    labelKey: "nav.orders",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    href: "/dashboard/clients",
    labelKey: "nav.clients",
    icon: <Users className="h-5 w-5" />,
  },
  {
    href: "/dashboard/automation",
    labelKey: "nav.automation",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    href: "/dashboard/integrations",
    labelKey: "nav.integrations",
    icon: <Link2 className="h-5 w-5" />,
  },
  {
    href: "/dashboard/settings",
    labelKey: "nav.settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useI18n();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg border border-border shadow-md"
        aria-label="Toggle navigation"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static left-0 top-0 h-screen w-64 bg-card border-r border-border shadow-sm z-40 transform lg:transform-none transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo/Header */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-lg text-foreground"
          >
            <span className="text-2xl">🚀</span>
            <span className="text-foreground">SellFlow</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-2 px-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.icon}
                  <span>{t(item.labelKey)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <button
            className="w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg transition-colors flex items-center gap-3"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {t("nav.logout")}
          </button>
        </div>
      </aside>
    </>
  );
};
