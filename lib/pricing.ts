// lib/pricing.ts

/**
 * 計算訂單的財務拆解：總價、訂金(平台抽成)、尾款(大師實收)
 * @param totalPrice 服務總金額
 * @returns 包含 total, deposit, balance 的物件
 */
export function calculateOrderAmounts(totalPrice: number) {
  const COMMISSION_RATE = 0.2; // 平台抽成比例 (25%)
  const COMMISSION_CAP = 800;   // 平台抽成封頂上限 ($800)

  // 1. 計算訂金：取「總價*25%」與「800」之間的最小值
  const deposit = Math.min(totalPrice * COMMISSION_RATE, COMMISSION_CAP);
  
  // 2. 計算尾款：總價扣掉訂金
  const balance = totalPrice - deposit;

  return {
    total: totalPrice,
    deposit: deposit,
    balance: balance
  };
}