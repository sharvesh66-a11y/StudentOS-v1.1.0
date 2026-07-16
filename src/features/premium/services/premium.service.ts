/**
 * StudentOS Premium Service
 * Subscription management + feature gating.
 */
import { db, COLLECTIONS, type StudentOSFirebaseError } from '@/firebase';
import { normalizeFirebaseError } from '@/firebase/error-handler';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { UserSubscription, PlanTier, PlanLimits, ToolType } from '../../tools/types';
import { PREMIUM_PLANS } from '../../tools/types';

export interface PremiumResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

const FREE_LIMITS = PREMIUM_PLANS.find((p) => p.tier === 'free')!.limits;

export async function getSubscription(
  uid: string,
): Promise<PremiumResult<UserSubscription | null>> {
  try {
    const ref = doc(db, COLLECTIONS.SUBSCRIPTIONS, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: snap.data() as UserSubscription };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function ensureSubscription(uid: string): Promise<PremiumResult<UserSubscription>> {
  try {
    const ref = doc(db, COLLECTIONS.SUBSCRIPTIONS, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const today = new Date().toISOString().split('T')[0];
      const data: UserSubscription = {
        uid,
        tier: 'free',
        startedAt: Date.now(),
        expiresAt: null,
        autoRenew: false,
        usage: { date: today, aiChats: 0, notes: 0, quizzes: 0 },
        updatedAt: Date.now(),
      };
      await setDoc(ref, { ...data, updatedAt: serverTimestamp() });
      return { success: true, data };
    }
    return { success: true, data: snap.data() as UserSubscription };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function updatePlan(uid: string, tier: PlanTier): Promise<PremiumResult<void>> {
  try {
    await ensureSubscription(uid);
    const ref = doc(db, COLLECTIONS.SUBSCRIPTIONS, uid);
    await setDoc(
      ref,
      {
        tier,
        startedAt: Date.now(),
        expiresAt: tier === 'free' ? null : Date.now() + 30 * 24 * 60 * 60 * 1000,
        autoRenew: tier !== 'free',
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export function getLimits(tier: PlanTier): PlanLimits {
  return PREMIUM_PLANS.find((p) => p.tier === tier)?.limits ?? FREE_LIMITS;
}

export function canAccessTool(tier: PlanTier, tool: ToolType): boolean {
  const limits = getLimits(tier);
  return limits.aiTools.includes(tool);
}

export function isPremiumFeature(tier: PlanTier, feature: keyof PlanLimits): boolean {
  const limits = getLimits(tier);
  return Boolean(limits[feature]);
}

export async function incrementUsage(
  uid: string,
  field: 'aiChats' | 'notes' | 'quizzes',
): Promise<PremiumResult<void>> {
  try {
    const subResult = await ensureSubscription(uid);
    if (!subResult.success || !subResult.data) return { success: false, error: subResult.error };
    const sub = subResult.data;
    const today = new Date().toISOString().split('T')[0];
    const usage =
      sub.usage.date === today
        ? { ...sub.usage, [field]: sub.usage[field] + 1 }
        : {
            date: today,
            aiChats: field === 'aiChats' ? 1 : 0,
            notes: field === 'notes' ? 1 : 0,
            quizzes: field === 'quizzes' ? 1 : 0,
          };
    const ref = doc(db, COLLECTIONS.SUBSCRIPTIONS, uid);
    await setDoc(ref, { usage, updatedAt: serverTimestamp() }, { merge: true });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export function checkLimit(
  tier: PlanTier,
  usage: UserSubscription['usage'],
  field: 'aiChats' | 'notes' | 'quizzes',
): boolean {
  const limits = getLimits(tier);
  const limitMap = {
    aiChats: limits.aiChatsPerDay,
    notes: limits.notesPerDay,
    quizzes: limits.quizzesPerDay,
  };
  const limit = limitMap[field];
  if (limit === -1) return true;
  return usage[field] < limit;
}

export const premiumService = {
  getSubscription,
  ensureSubscription,
  updatePlan,
  getLimits,
  canAccessTool,
  isPremiumFeature,
  incrementUsage,
  checkLimit,
} as const;
