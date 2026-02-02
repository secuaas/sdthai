'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ordersApi, Order } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const statusColors: Record<Order['statut'], 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  EN_ATTENTE: 'warning',
  CONFIRMEE: 'secondary',
  PREPAREE: 'default',
  LIVREE: 'success',
  ANNULEE: 'destructive',
};

export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.list({ limit: 100 });
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Chargement des commandes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes Commandes</h1>
          <p className="text-muted-foreground">Gérez vos commandes</p>
        </div>
        <Link href="/partner/commandes/nouvelle">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Commande
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro</TableHead>
              <TableHead>Date Livraison</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date Création</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Aucune commande
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.numero}</TableCell>
                  <TableCell>{formatDate(order.dateLivraison)}</TableCell>
                  <TableCell>{order.items.length} article(s)</TableCell>
                  <TableCell>{formatCurrency(order.montantTotal)}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[order.statut]}>{order.statut}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
