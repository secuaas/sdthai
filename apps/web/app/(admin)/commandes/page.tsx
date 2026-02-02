'use client';

import { useEffect, useState } from 'react';
import { ordersApi, Order } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';

const statusColors: Record<Order['statut'], 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  EN_ATTENTE: 'warning',
  CONFIRMEE: 'secondary',
  PREPAREE: 'default',
  LIVREE: 'success',
  ANNULEE: 'destructive',
};

const statusTransitions: Record<Order['statut'], Order['statut'][]> = {
  EN_ATTENTE: ['CONFIRMEE', 'ANNULEE'],
  CONFIRMEE: ['PREPAREE', 'ANNULEE'],
  PREPAREE: ['LIVREE', 'ANNULEE'],
  LIVREE: [],
  ANNULEE: [],
};

export default function CommandesAdminPage() {
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

  const updateStatus = async (orderId: string, newStatus: Order['statut']) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      await loadOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) {
    return <div>Chargement des commandes...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Commandes</h1>
        <p className="text-muted-foreground">Gérez toutes les commandes de la plateforme</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro</TableHead>
              <TableHead>Partenaire</TableHead>
              <TableHead>Date Livraison</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Aucune commande
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.numero}</TableCell>
                  <TableCell>{order.partenaire?.nomCommercial || 'N/A'}</TableCell>
                  <TableCell>{formatDate(order.dateLivraison)}</TableCell>
                  <TableCell>{order.items.length} article(s)</TableCell>
                  <TableCell>{formatCurrency(order.montantTotal)}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[order.statut]}>{order.statut}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {statusTransitions[order.statut].map((newStatus) => (
                        <Button
                          key={newStatus}
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(order.id, newStatus)}
                        >
                          {newStatus}
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
