'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  FileText,
} from 'lucide-react';

interface SidebarProps {
  role: 'ADMIN' | 'PARTNER';
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/partenaires', label: 'Partenaires', icon: Users },
    { href: '/admin/produits', label: 'Produits', icon: Package },
    { href: '/admin/commandes', label: 'Commandes', icon: ShoppingCart },
  ];

  const partnerLinks = [
    { href: '/partner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/partner/commandes', label: 'Mes Commandes', icon: FileText },
    { href: '/partner/commandes/nouvelle', label: 'Nouvelle Commande', icon: ShoppingCart },
  ];

  const links = role === 'ADMIN' ? adminLinks : partnerLinks;

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {role === 'ADMIN' ? 'Administration' : 'Espace Partenaire'}
          </h2>
          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
                    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
