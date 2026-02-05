'use client';

import { useState } from 'react';
import { partnerSessionsApi, partnersApi, Partner } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Search, Key } from 'lucide-react';

export default function PartnerSessionsPage() {
  const [code, setCode] = useState('');
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    session?: any;
    message: string;
  } | null>(null);
  const [partnerId, setPartnerId] = useState('');
  const [generatedSession, setGeneratedSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      setLoading(true);
      const session = await partnerSessionsApi.validate(code.trim());
      setValidationResult({
        valid: true,
        session,
        message: `Code valide pour le partenaire: ${session.partnerName || session.partnerId}`,
      });
      setCode('');
    } catch (err) {
      setValidationResult({
        valid: false,
        message: 'Code invalide ou expiré',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId.trim()) return;

    try {
      setLoading(true);
      const session = await partnerSessionsApi.create(partnerId.trim());
      setGeneratedSession(session);
      setPartnerId('');
    } catch (err) {
      console.error('Failed to generate session code:', err);
      alert('Erreur lors de la génération du code de session');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateSession = async (sessionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver ce code de session?')) return;

    try {
      await partnerSessionsApi.deactivate(sessionId);
      setGeneratedSession(null);
      alert('Code de session désactivé avec succès');
    } catch (err) {
      console.error('Failed to deactivate session:', err);
      alert('Erreur lors de la désactivation du code de session');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Codes de Session Partenaire</h1>
        <p className="text-muted-foreground">
          Validation et génération de codes de session temporaires
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Validation Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Valider un Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleValidateCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code de Session</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Entrer le code à valider (ex: ABC123)"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  autoFocus
                />
              </div>

              <Button type="submit" disabled={loading || !code.trim()} className="w-full">
                {loading ? 'Validation...' : 'Valider le Code'}
              </Button>
            </form>

            {validationResult && (
              <div
                className={`mt-4 p-4 rounded-lg border ${
                  validationResult.valid
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {validationResult.valid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        validationResult.valid ? 'text-green-900' : 'text-red-900'
                      }`}
                    >
                      {validationResult.message}
                    </p>
                    {validationResult.session && (
                      <div className="mt-2 space-y-1 text-sm text-green-800">
                        <p>
                          <strong>Code:</strong> {validationResult.session.code}
                        </p>
                        <p>
                          <strong>Partenaire ID:</strong> {validationResult.session.partnerId}
                        </p>
                        <p>
                          <strong>Expire le:</strong>{' '}
                          {new Date(validationResult.session.expiresAt).toLocaleString('fr-FR')}
                        </p>
                        <Badge
                          variant={
                            validationResult.session.isActive ? 'default' : 'secondary'
                          }
                          className="mt-2"
                        >
                          {validationResult.session.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generation Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Générer un Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="partnerId">ID Partenaire</Label>
                <Input
                  id="partnerId"
                  type="text"
                  placeholder="UUID du partenaire"
                  value={partnerId}
                  onChange={(e) => setPartnerId(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !partnerId.trim()}
                className="w-full"
              >
                {loading ? 'Génération...' : 'Générer un Code de Session'}
              </Button>
            </form>

            {generatedSession && (
              <div className="mt-4 p-4 rounded-lg border bg-blue-50 border-blue-200">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <p className="font-medium text-blue-900">Code généré avec succès!</p>
                  </div>

                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-xs text-muted-foreground mb-1">Code de Session:</p>
                    <p className="text-2xl font-bold text-blue-600 font-mono tracking-wider">
                      {generatedSession.code}
                    </p>
                  </div>

                  <div className="space-y-1 text-sm text-blue-800">
                    <p>
                      <strong>Partenaire ID:</strong> {generatedSession.partnerId}
                    </p>
                    <p>
                      <strong>Créé le:</strong>{' '}
                      {new Date(generatedSession.createdAt).toLocaleString('fr-FR')}
                    </p>
                    <p>
                      <strong>Expire le:</strong>{' '}
                      {new Date(generatedSession.expiresAt).toLocaleString('fr-FR')}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedSession.code);
                        alert('Code copié dans le presse-papier!');
                      }}
                      className="flex-1"
                    >
                      Copier le Code
                    </Button>
                    {generatedSession.isActive && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeactivateSession(generatedSession.id)}
                        className="flex-1"
                      >
                        Désactiver
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>À propos des Codes de Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Les codes de session partenaire permettent une authentification temporaire et
            sécurisée.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Format: 6 caractères alphanumériques (ex: ABC123)</li>
            <li>Durée de validité: 24 heures par défaut</li>
            <li>Un seul code actif par partenaire à la fois</li>
            <li>Utilisés pour les points de vente automatiques (DEPOT_AUTOMATE)</li>
            <li>Peuvent être désactivés manuellement à tout moment</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
