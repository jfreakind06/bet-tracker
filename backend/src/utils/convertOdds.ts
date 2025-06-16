export function convertAmericanToDecimal(odds: number): number {
  if (odds > 0) return (odds / 100) + 1;
  if (odds < 0) return (100 / Math.abs(odds)) + 1;
  return 1; // fallback
}

export function calculatePayoutFromOdds(amount: number, odds: number): number {
  if (odds > 0) {
    return amount + (amount * odds) / 100;
  } else {
    return amount + (amount * 100) / Math.abs(odds);
  }
}

