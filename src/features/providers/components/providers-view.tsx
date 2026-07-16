'use client';

/**
 * AI Provider Manager View
 *
 * Displays all available AI providers in two categories (Free + Premium).
 * Users can connect free providers (architecture only — no actual API calls
 * yet) and see Coming Soon for premium providers.
 *
 * Adding a new provider requires ONLY editing `provider-config.ts`.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, ExternalLink, Key, Plug, Zap, Cpu, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FREE_PROVIDERS, PREMIUM_PROVIDERS, type AIProvider } from '../provider-config';

export function ProvidersView() {
  const [connectProvider, setConnectProvider] = useState<AIProvider | null>(null);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [apiKey, setApiKey] = useState('');
  const [customEndpoint, setCustomEndpoint] = useState('');

  const handleConnect = (provider: AIProvider) => {
    if (provider.status === 'coming-soon') {
      toast.info(`${provider.name} is coming soon!`, {
        description: 'We are working on integrating this provider.',
      });
      return;
    }
    setConnectProvider(provider);
    setApiKey('');
    setCustomEndpoint('');
  };

  const handleSaveKey = () => {
    if (!connectProvider) return;
    if (connectProvider.requiresApiKey && !apiKey.trim()) {
      toast.error('Please enter your API key');
      return;
    }
    if (connectProvider.id === 'custom-api' && !customEndpoint.trim()) {
      toast.error('Please enter your API endpoint URL');
      return;
    }
    setConnectedIds((prev) => new Set(prev).add(connectProvider.id));
    toast.success(`${connectProvider.name} connected!`, {
      description: connectProvider.requiresApiKey
        ? 'Your API key has been saved locally.'
        : connectProvider.id === 'custom-api'
          ? 'Custom API endpoint configured.'
          : 'Local provider is ready to use.',
    });
    setConnectProvider(null);
    setApiKey('');
    setCustomEndpoint('');
  };

  const handleDisconnect = (provider: AIProvider) => {
    setConnectedIds((prev) => {
      const next = new Set(prev);
      next.delete(provider.id);
      return next;
    });
    toast.success(`${provider.name} disconnected`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 ring-primary/20 flex h-12 w-12 items-center justify-center rounded-xl ring-1">
            <Plug className="text-primary h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Provider Manager</h1>
            <p className="text-muted-foreground text-sm">
              Connect your preferred AI providers. Free providers are available now.
            </p>
          </div>
        </div>
      </div>

      {/* Free providers */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-green-400" />
          <h2 className="text-lg font-semibold">Free AI Providers</h2>
          <Badge variant="secondary">{FREE_PROVIDERS.length} available</Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FREE_PROVIDERS.map((provider, i) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              connected={connectedIds.has(provider.id)}
              onConnect={() => handleConnect(provider)}
              onDisconnect={() => handleDisconnect(provider)}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Premium providers */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-yellow-400" />
          <h2 className="text-lg font-semibold">Premium AI Providers</h2>
          <Badge variant="outline" className="border-yellow-500/30 text-yellow-500">
            Coming Soon
          </Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PREMIUM_PROVIDERS.map((provider, i) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              connected={false}
              onConnect={() => handleConnect(provider)}
              onDisconnect={() => handleDisconnect(provider)}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Connect dialog */}
      <Dialog
        open={Boolean(connectProvider)}
        onOpenChange={(open) => !open && setConnectProvider(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {connectProvider && (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ backgroundColor: connectProvider.brandColor }}
                >
                  {connectProvider.name.charAt(0)}
                </div>
              )}
              Connect to {connectProvider?.name}
            </DialogTitle>
            <DialogDescription>{connectProvider?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {connectProvider?.requiresApiKey ? (
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Paste your API key here"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                {connectProvider.apiKeyUrl && (
                  <a
                    href={connectProvider.apiKeyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
                  >
                    Get your API key from {connectProvider.name}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <p className="text-muted-foreground text-xs">
                  Your API key is stored locally and never sent to our servers.
                </p>
              </div>
            ) : connectProvider?.id === 'custom-api' ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="api-endpoint">API Endpoint URL</Label>
                  <Input
                    id="api-endpoint"
                    type="url"
                    placeholder="https://your-api-endpoint.com/v1"
                    value={customEndpoint}
                    onChange={(e) => setCustomEndpoint(e.target.value)}
                  />
                  <p className="text-muted-foreground text-xs">
                    Enter the base URL of any OpenAI-compatible API endpoint.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key-optional">API Key (optional)</Label>
                  <Input
                    id="api-key-optional"
                    type="password"
                    placeholder="Optional — only if your endpoint requires authentication"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-muted/30 rounded-lg p-4 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  <Cpu className="text-primary h-4 w-4" />
                  Local Provider
                </p>
                <p className="text-muted-foreground mt-2">
                  This provider runs on your local machine. Make sure {connectProvider?.name} is
                  installed and running before connecting.
                </p>
              </div>
            )}

            {connectProvider && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-medium">Available models:</p>
                <div className="flex flex-wrap gap-1.5">
                  {connectProvider.models.map((model) => (
                    <Badge key={model} variant="outline" className="text-xs">
                      {model}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectProvider(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveKey}>
              <Check className="mr-2 h-4 w-4" />
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Provider Card
// ---------------------------------------------------------------------------

interface ProviderCardProps {
  provider: AIProvider;
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  index: number;
}

function ProviderCard({ provider, connected, onConnect, onDisconnect, index }: ProviderCardProps) {
  const isComingSoon = provider.status === 'coming-soon';
  const isLocal = !provider.requiresApiKey;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="group hover:border-border hover:shadow-primary/5 relative overflow-hidden p-5 backdrop-blur-sm transition-all hover:shadow-lg">
        {/* Hover glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
          style={{ backgroundColor: `${provider.brandColor}30` }}
        />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: provider.brandColor }}
              >
                {provider.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold">{provider.name}</h3>
                  {isLocal && (
                    <Badge variant="outline" className="border-blue-500/30 text-xs text-blue-500">
                      <Cpu className="mr-1 h-2.5 w-2.5" />
                      Local
                    </Badge>
                  )}
                </div>
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 text-xs"
                >
                  Visit website
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>

            {/* Status badge */}
            {isComingSoon ? (
              <Badge variant="outline" className="border-yellow-500/30 text-xs text-yellow-500">
                <Lock className="mr-1 h-2.5 w-2.5" />
                Soon
              </Badge>
            ) : connected ? (
              <Badge variant="outline" className="border-green-500/30 text-xs text-green-500">
                <Check className="mr-1 h-2.5 w-2.5" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="border-blue-500/30 text-xs text-blue-500">
                <Cloud className="mr-1 h-2.5 w-2.5" />
                Available
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground mt-3 text-sm">{provider.description}</p>

          {/* Models */}
          <div className="mt-3 flex flex-wrap gap-1">
            {provider.models.slice(0, 3).map((model) => (
              <span
                key={model}
                className="bg-muted/40 text-muted-foreground rounded-md px-2 py-0.5 text-[10px]"
              >
                {model}
              </span>
            ))}
            {provider.models.length > 3 && (
              <span className="bg-muted/40 text-muted-foreground rounded-md px-2 py-0.5 text-[10px]">
                +{provider.models.length - 3} more
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4">
            {isComingSoon ? (
              <Button variant="outline" size="sm" className="w-full" disabled>
                <Lock className="mr-2 h-3.5 w-3.5" />
                Coming Soon
              </Button>
            ) : connected ? (
              <Button variant="outline" size="sm" className="w-full" onClick={onDisconnect}>
                Disconnect
              </Button>
            ) : (
              <Button size="sm" className="w-full" onClick={onConnect}>
                {provider.requiresApiKey ? (
                  <>
                    <Key className="mr-2 h-3.5 w-3.5" />
                    Connect
                  </>
                ) : (
                  <>
                    <Plug className="mr-2 h-3.5 w-3.5" />
                    Connect Local
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
