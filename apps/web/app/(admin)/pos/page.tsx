'use client';

import { useEffect, useState } from 'react';
import { productsApi, posApi, Product, CreatePOSTransactionDto } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CASH');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsApi.list({ limit: 100 });
      setProducts(response.data.filter(p => p.isActive));
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    try {
      const product = await productsApi.getByBarcode(barcodeInput);
      addToCart(product);
      setBarcodeInput('');
    } catch (err) {
      console.error('Product not found:', err);
      alert('Produit non trouvé');
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const price = item.product.unitPrice || item.product.prixUnitaire || 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Le panier est vide');
      return;
    }

    if (!partnerId.trim()) {
      alert('Veuillez entrer un ID partenaire');
      return;
    }

    try {
      setLoading(true);
      const transactionData: CreatePOSTransactionDto = {
        partnerId: partnerId.trim(),
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        paymentMethod,
      };

      await posApi.create(transactionData);

      // Reset cart and form
      setCart([]);
      setBarcodeInput('');
      alert('Transaction enregistrée avec succès!');
    } catch (err) {
      console.error('Transaction failed:', err);
      alert('Erreur lors de l\'enregistrement de la transaction');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    (p.name || p.nom || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Point de Vente (POS)</h1>
        <p className="text-muted-foreground">Système de caisse pour DEPOT_AUTOMATE</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Panel - Product Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scanner / Recherche</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleBarcodeSubmit} className="space-y-2">
                <Label htmlFor="barcode">Code-barres</Label>
                <div className="flex gap-2">
                  <Input
                    id="barcode"
                    type="text"
                    placeholder="Scanner ou entrer le code-barres"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    autoFocus
                  />
                  <Button type="submit">Ajouter</Button>
                </div>
              </form>

              <div className="space-y-2">
                <Label htmlFor="search">Recherche produit</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Nom ou SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="max-h-96 overflow-y-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name || product.nom}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell>{formatCurrency(product.unitPrice || product.prixUnitaire || 0)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToCart(product)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Cart & Checkout */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Panier ({cart.length} articles)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Le panier est vide</p>
              ) : (
                <>
                  <div className="max-h-64 overflow-y-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produit</TableHead>
                          <TableHead>Qté</TableHead>
                          <TableHead>Prix</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cart.map((item) => {
                          const price = item.product.unitPrice || item.product.prixUnitaire || 0;
                          return (
                            <TableRow key={item.product.id}>
                              <TableCell className="font-medium">
                                {item.product.name || item.product.nom}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateQuantity(item.product.id, -1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center">{item.quantity}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateQuantity(item.product.id, 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>{formatCurrency(price * item.quantity)}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeFromCart(item.product.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="partnerId">ID Partenaire</Label>
                      <Input
                        id="partnerId"
                        type="text"
                        placeholder="Entrer l'ID du partenaire"
                        value={partnerId}
                        onChange={(e) => setPartnerId(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Méthode de paiement</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={paymentMethod === 'CASH' ? 'default' : 'outline'}
                          onClick={() => setPaymentMethod('CASH')}
                          className="flex-1"
                        >
                          Espèces
                        </Button>
                        <Button
                          variant={paymentMethod === 'CARD' ? 'default' : 'outline'}
                          onClick={() => setPaymentMethod('CARD')}
                          className="flex-1"
                        >
                          Carte
                        </Button>
                        <Button
                          variant={paymentMethod === 'TRANSFER' ? 'default' : 'outline'}
                          onClick={() => setPaymentMethod('TRANSFER')}
                          className="flex-1"
                        >
                          Virement
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      disabled={loading || cart.length === 0}
                      className="w-full"
                      size="lg"
                    >
                      {loading ? 'Traitement...' : 'Valider la transaction'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
