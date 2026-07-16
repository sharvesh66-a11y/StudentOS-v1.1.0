'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import { premiumService } from '../services/premium.service';
import type { UserSubscription, PlanTier } from '../../tools/types';

export function usePremium() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void premiumService.ensureSubscription(user.uid).then((r) => {
      if (r.success && r.data) setSubscription(r.data);
      setIsLoading(false);
    });
  }, [user]);

  const upgrade = async (tier: PlanTier) => {
    if (!user) return;
    await premiumService.updatePlan(user.uid, tier);
    const r = await premiumService.getSubscription(user.uid);
    if (r.success && r.data) setSubscription(r.data);
  };

  const tier = subscription?.tier ?? 'free';
  const limits = premiumService.getLimits(tier);

  return { subscription, tier, limits, isLoading: user ? isLoading : false, upgrade };
}
