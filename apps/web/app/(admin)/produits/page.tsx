'use client';

import { useEffect, useState } from 'react';
import { productsApi, Product } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

export default function ProduitsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.list({ limit: 100 });
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Chargement des produits...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Produits</h1>
        <p className="text-muted-foreground">Gérez le catalogue de produits</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix Unitaire</TableHead>
              <TableHead>Unité</TableHead>
              <TableHead>Disponibilité</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Aucun produit
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.nom}</TableCell>
                  <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.categorie}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(product.prixUnitaire)}</TableCell>
                  <TableCell>{product.unite}</TableCell>
                  <TableCell>
                    <Badge variant={product.disponible ? 'success' : 'destructive'}>
                      {product.disponible ? 'Disponible' : 'Indisponible'}
                    </Badge>
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
