// lib/pricing.ts

/**
 * 💰 極致讓利版：無條件捨去階梯計價 (保底100 + 每滿200抽50 + 封頂800)
 * 範例：總價 599 -> 取整 2 階梯 -> 2*50=100 -> 保底 100 -> 最終平台抽成 100
 * @param totalPrice 服務總金額
 * @returns 包含 total, deposit, balance 的物件
 */
export function calculateOrderAmounts(totalPrice: number) {
  if (!totalPrice || totalPrice <= 0) return { total: 0, deposit: 0, balance: 0 };

  // 1. 理論抽成：嚴格計算 200 的完整倍數 (Math.floor 無條件捨去)
  const steps = Math.floor(totalPrice / 200);
  let deposit = steps * 50;

  // 2. 最低消費限制 (保底 100)
  deposit = Math.max(deposit, 100);

  // 3. 封頂機制 (上限 800)
  deposit = Math.min(deposit, 800);

  // 4. 極端防呆：萬一總價低於 100，訂金不能超過總價
  deposit = Math.min(deposit, totalPrice);

  // 5. 計算現場尾款
  const balance = totalPrice - deposit;

  return { total: totalPrice, deposit, balance };
}