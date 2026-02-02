'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, ShoppingCart } from 'lucide-react';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">SD Thai Food</span>
          </Link>
        </div>

        <nav className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center space-x-4">
            {!isAuthenticated && (
              <>
                <Link href="/produits">
                  <Button variant="ghost">Produits</Button>
                </Link>
                <Link href="/login">
                  <Button variant="default">Connexion</Button>
                </Link>
              </>
            )}

            {isAuthenticated && (
              <>
                <span className="text-sm text-muted-foreground">
                  {user?.prenom} {user?.nom}
                </span>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
