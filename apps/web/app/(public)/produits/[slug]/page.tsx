'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productsApi, Product } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.slug) {
      loadProduct(params.slug as string);
    }
  }, [params.slug]);

  const loadProduct = async (id: string) => {
    try {
      setLoading(true);
      const data = await productsApi.get(id);
      setProduct(data);
    } catch (err) {
      setError('Produit non trouvé');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center">Chargement du produit...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-10">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div className="text-center text-destructive">{error || 'Produit non trouvé'}</div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">{product.nom}</CardTitle>
              <CardDescription className="text-lg mt-2">
                {product.description}
              </CardDescription>
            </div>
            <Badge variant={product.disponible ? 'success' : 'destructive'} className="text-sm">
              {product.disponible ? 'Disponible' : 'Indisponible'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatCurrency(product.prixUnitaire)}</span>
            <span className="text-xl text-muted-foreground">/ {product.unite}</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Catégorie</h3>
              <Badge variant="outline">{product.categorie}</Badge>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Unité de vente</h3>
              <p className="text-muted-foreground">{product.unite}</p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Créé le {formatDateTime(product.createdAt)}</p>
            <p>Mis à jour le {formatDateTime(product.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
