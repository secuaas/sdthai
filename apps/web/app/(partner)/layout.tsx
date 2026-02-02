'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { Footer } from '@/components/layout/footer';

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isPartner, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isPartner)) {
      router.push('/login');
    }
  }, [isAuthenticated, isPartner, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isPartner) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar role="PARTNER" />
        <main className="flex-1 ml-64 p-8">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
