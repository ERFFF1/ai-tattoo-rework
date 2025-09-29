export const CREDIT_COST = {
  refine2K: 1,
  refine4K: 2,
  mockup: 1,
  export: 1,
};

export async function checkCredits(userId: string, cost: number): Promise<{ ok: boolean; balance?: number; error?: string }> {
  // TODO: Implement with real database (Supabase/Neon)
  // For now, always allow (development mode)
  return { ok: true, balance: 100 };
}

export async function deductCredits(userId: string, cost: number): Promise<{ ok: boolean; newBalance?: number; error?: string }> {
  // TODO: Implement with real database
  console.log(`[DB] Deducting ${cost} credits from ${userId}`);
  return { ok: true, newBalance: 95 };
}
