'use client';

import { useEffect, useState } from 'react';
import { partnersApi, Partner } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

const statusColors: Record<Partner['statut'], 'default' | 'success' | 'warning' | 'destructive'> = {
  ACTIF: 'success',
  INACTIF: 'destructive',
  EN_ATTENTE: 'warning',
};

export default function PartenairesPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const response = await partnersApi.list({ limit: 100 });
      setPartners(response.data);
    } catch (err) {
      console.error('Failed to load partners:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Chargement des partenaires...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Partenaires</h1>
        <p className="text-muted-foreground">Gérez les partenaires de la plateforme</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom Commercial</TableHead>
              <TableHead>Raison Sociale</TableHead>
              <TableHead>SIRET</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Aucun partenaire
                </TableCell>
              </TableRow>
            ) : (
              partners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell className="font-medium">{partner.nomCommercial}</TableCell>
                  <TableCell>{partner.raisonSociale}</TableCell>
                  <TableCell>{partner.siret}</TableCell>
                  <TableCell>{partner.email}</TableCell>
                  <TableCell>{partner.telephone}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[partner.statut]}>{partner.statut}</Badge>
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
