import { UserAccount } from '../types';

export const DAILY_NUTRIA_FREE_LIMIT = 30;
export const NUTRIA_WARNING_THRESHOLD = 25;

export interface NutriaQuotaStatus {
  count: number;
  limit: number;
  remaining: number;
  date: string;
  isLimitReached: boolean;
  isWarningZone: boolean;
  isUnlimited: boolean;
}

/**
 * Returns today's local date in YYYY-MM-DD format
 */
export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Verifies if user has active unlimited subscription
 */
export function isUserPlanUnlimited(userAccount?: UserAccount | null): boolean {
  if (!userAccount) return false;
  const plan = userAccount.plan;
  return plan === 'premium_mensal' || plan === 'premium_anual' || Boolean(userAccount.isSubscribed);
}

/**
 * Retrieves current persisted daily Nutria usage.
 * Automatically checks and handles new day resets (F5 will NEVER reset today's count).
 */
export function getDailyNutriaUsage(userAccount?: UserAccount | null): NutriaQuotaStatus {
  const isUnlimited = isUserPlanUnlimited(userAccount);
  const today = getTodayDateKey();
  const cleanEmail = userAccount?.email?.trim().toLowerCase();

  // 1. Check date stored in localStorage
  const globalDate = localStorage.getItem('nutria_msg_date');
  const emailDate = cleanEmail ? localStorage.getItem(`nutria_msg_date_${cleanEmail}`) : null;
  const effectiveDate = emailDate || globalDate;

  let currentCount = 0;

  if (effectiveDate !== today) {
    // New day: reset count to 0 and update date to today
    currentCount = 0;
    try {
      localStorage.setItem('nutria_msg_date', today);
      localStorage.setItem('nutria_msg_count', '0');
      if (cleanEmail) {
        localStorage.setItem(`nutria_msg_date_${cleanEmail}`, today);
        localStorage.setItem(`nutria_msg_count_${cleanEmail}`, '0');
      }
    } catch {}
  } else {
    // Same day: retrieve exact count
    const globalCountRaw = localStorage.getItem('nutria_msg_count');
    const emailCountRaw = cleanEmail ? localStorage.getItem(`nutria_msg_count_${cleanEmail}`) : null;
    
    const parsedGlobal = globalCountRaw ? parseInt(globalCountRaw, 10) : 0;
    const parsedEmail = emailCountRaw ? parseInt(emailCountRaw, 10) : 0;
    const sessionCount = userAccount?.dailyMessageCount || 0;

    currentCount = Math.max(
      isNaN(parsedGlobal) ? 0 : parsedGlobal,
      isNaN(parsedEmail) ? 0 : parsedEmail,
      sessionCount
    );
  }

  const limit = DAILY_NUTRIA_FREE_LIMIT;
  const remaining = Math.max(0, limit - currentCount);
  const isLimitReached = !isUnlimited && currentCount >= limit;
  const isWarningZone = !isUnlimited && currentCount >= NUTRIA_WARNING_THRESHOLD && currentCount < limit;

  return {
    count: currentCount,
    limit,
    remaining,
    date: today,
    isLimitReached,
    isWarningZone,
    isUnlimited
  };
}

/**
 * Increments daily message counter and saves to persistent storage.
 */
export function incrementDailyNutriaUsage(userAccount?: UserAccount | null): NutriaQuotaStatus {
  const today = getTodayDateKey();
  const cleanEmail = userAccount?.email?.trim().toLowerCase();

  const currentStatus = getDailyNutriaUsage(userAccount);
  const nextCount = currentStatus.count + 1;

  try {
    localStorage.setItem('nutria_msg_date', today);
    localStorage.setItem('nutria_msg_count', String(nextCount));
    localStorage.setItem('nutrink_guest_msg_count', String(nextCount));

    if (cleanEmail) {
      localStorage.setItem(`nutria_msg_date_${cleanEmail}`, today);
      localStorage.setItem(`nutria_msg_count_${cleanEmail}`, String(nextCount));
    }

    // Sync user session
    const rawSession = localStorage.getItem('nutrink_user_session');
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      const updated = {
        ...parsed,
        dailyMessageCount: nextCount,
        lastDailyMessageDate: today
      };
      localStorage.setItem('nutrink_user_session', JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Erro ao persistir contador de mensagens diárias:', e);
  }

  const isUnlimited = currentStatus.isUnlimited;
  const limit = DAILY_NUTRIA_FREE_LIMIT;
  const remaining = Math.max(0, limit - nextCount);
  const isLimitReached = !isUnlimited && nextCount >= limit;
  const isWarningZone = !isUnlimited && nextCount >= NUTRIA_WARNING_THRESHOLD && nextCount < limit;

  return {
    count: nextCount,
    limit,
    remaining,
    date: today,
    isLimitReached,
    isWarningZone,
    isUnlimited
  };
}
