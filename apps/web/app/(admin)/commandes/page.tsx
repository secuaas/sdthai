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
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  PENDING: 'warning',
  EN_ATTENTE: 'warning',
  CONFIRMED: 'secondary',
  CONFIRMEE: 'secondary',
  PREPARED: 'default',
  PREPAREE: 'default',
  DELIVERED: 'success',
  LIVREE: 'success',
  CANCELLED: 'destructive',
  ANNULEE: 'destructive',
};

const deadlineColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
  STANDARD: 'default',
  LATE: 'secondary',
  DEROGATION: 'destructive',
};

const deliveryTypeLabels: Record<string, string> = {
  STANDARD: 'Livraison Standard',
  ON_SITE: 'Sur Place',
};

export default function CommandesAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending-approval'>('all');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (filter === 'pending-approval') {
        params.requiresApproval = true;
        params.status = 'PENDING';
      }
      const response = await ordersApi.list(params);
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      await loadOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const approveOrder = async (orderId: string) => {
    if (!confirm('Approuver cette commande urgente/tardive?')) return;
    try {
      await ordersApi.approve(orderId);
      await loadOrders();
      alert('Commande approuvée avec succès');
    } catch (err) {
      console.error('Failed to approve order:', err);
      alert('Erreur lors de l\'approbation de la commande');
    }
  };

  const rejectOrder = async (orderId: string) => {
    const reason = prompt('Raison du rejet (optionnel):');
    if (reason === null) return; // User cancelled
    try {
      await ordersApi.reject(orderId, reason || undefined);
      await loadOrders();
      alert('Commande rejetée');
    } catch (err) {
      console.error('Failed to reject order:', err);
      alert('Erreur lors du rejet de la commande');
    }
  };

  if (loading) {
    return <div>Chargement des commandes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Commandes</h1>
          <p className="text-muted-foreground">Gérez toutes les commandes de la plateforme</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Toutes
          </Button>
          <Button
            variant={filter === 'pending-approval' ? 'default' : 'outline'}
            onClick={() => setFilter('pending-approval')}
          >
            <Clock className="h-4 w-4 mr-2" />
            À Approuver
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro</TableHead>
              <TableHead>Partenaire</TableHead>
              <TableHead>Date Livraison</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  {filter === 'pending-approval' ? 'Aucune commande en attente d\'approbation' : 'Aucune commande'}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const orderNum = order.orderNumber || order.numero || 'N/A';
                const partnerName = order.partner?.nomCommercial || order.partenaire?.nomCommercial || 'N/A';
                const deliveryDate = order.requestedDate || order.dateLivraison;
                const total = order.total || order.montantTotal || 0;
                const status = order.status || order.statut || 'PENDING';
                const deliveryType = order.deliveryType || 'STANDARD';
                const deadlineType = order.deadlineType || 'STANDARD';
                const requiresApproval = order.requiresApproval;
                const isUrgent = order.isUrgent;

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {orderNum}
                        {isUrgent && (
                          <AlertCircle className="h-4 w-4 text-orange-500" title="Commande urgente" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{partnerName}</TableCell>
                    <TableCell>
                      <div>
                        {formatDate(deliveryDate)}
                        {deliveryType === 'ON_SITE' && order.onSiteDeliveryTime && (
                          <div className="text-xs text-muted-foreground">
                            {new Date(order.onSiteDeliveryTime).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{deliveryTypeLabels[deliveryType]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={deadlineColors[deadlineType]}>{deadlineType}</Badge>
                    </TableCell>
                    <TableCell>{order.items?.length || 0} article(s)</TableCell>
                    <TableCell>{formatCurrency(total)}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[status]}>{status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {requiresApproval && status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => approveOrder(order.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => rejectOrder(order.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeter
                            </Button>
                          </>
                        )}
                        {!requiresApproval && status === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(order.id, 'CONFIRMED')}
                          >
                            Confirmer
                          </Button>
                        )}
                        {status === 'CONFIRMED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(order.id, 'PREPARED')}
                          >
                            Préparer
                          </Button>
                        )}
                        {status === 'PREPARED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(order.id, 'DELIVERED')}
                          >
                            Livrer
                          </Button>
                        )}
                        {status !== 'CANCELLED' && status !== 'DELIVERED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600"
                            onClick={() => updateStatus(order.id, 'CANCELLED')}
                          >
                            Annuler
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
