'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productsApi, ordersApi, Product, OrderItem } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function NouvelleCommandePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [dateLivraison, setDateLivraison] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
    // Set default delivery date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDateLivraison(tomorrow.toISOString().split('T')[0]);
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.list({ limit: 100 });
      setProducts(response.data.filter((p) => p.disponible));
    } catch (err) {
      setError('Erreur lors du chargement des produits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.product.id !== productId));
    } else {
      setCart(
        cart.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + item.product.prixUnitaire * item.quantity,
      0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError('Votre panier est vide');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const items: OrderItem[] = cart.map((item) => ({
        produitId: item.product.id,
        quantite: item.quantity,
        prixUnitaire: item.product.prixUnitaire,
      }));

      await ordersApi.create({
        items,
        dateLivraison,
        commentaire: commentaire || undefined,
      });

      router.push('/partner/commandes');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la commande');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouvelle Commande</h1>
        <p className="text-muted-foreground">Sélectionnez vos produits</p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Products List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Produits Disponibles</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{product.nom}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold">
                        {formatCurrency(product.prixUnitaire)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        / {product.unite}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {product.categorie}
                      </Badge>
                    </div>
                    <Button onClick={() => addToCart(product)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Panier</CardTitle>
              <CardDescription>{cart.length} article(s)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Votre panier est vide
                </p>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-2 border-b pb-3">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product.nom}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.product.prixUnitaire)} / {item.product.unite}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.product.id, parseInt(e.target.value) || 0)
                            }
                            className="h-6 w-12 text-center p-1"
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <Label htmlFor="dateLivraison">Date de livraison</Label>
                      <Input
                        id="dateLivraison"
                        type="date"
                        value={dateLivraison}
                        onChange={(e) => setDateLivraison(e.target.value)}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <Label htmlFor="commentaire">Commentaire (optionnel)</Label>
                      <Input
                        id="commentaire"
                        value={commentaire}
                        onChange={(e) => setCommentaire(e.target.value)}
                        placeholder="Instructions spéciales..."
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? 'En cours...' : 'Valider la commande'}
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
