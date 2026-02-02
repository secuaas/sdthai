'use client';

import { useEffect, useState } from 'react';
import { productsApi, Product } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export default function ProduitsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.list({ limit: 100 });
      setProducts(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des produits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center">Chargement des produits...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="text-center text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Nos Produits</h1>
        <p className="text-muted-foreground">
          Découvrez notre catalogue de produits thaïlandais
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{product.nom}</CardTitle>
                <Badge variant={product.disponible ? 'success' : 'destructive'}>
                  {product.disponible ? 'Disponible' : 'Indisponible'}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {product.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold">
                    {formatCurrency(product.prixUnitaire)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / {product.unite}
                  </span>
                </div>
                <Badge variant="outline">{product.categorie}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          Aucun produit disponible pour le moment
        </div>
      )}
    </div>
  );
}
