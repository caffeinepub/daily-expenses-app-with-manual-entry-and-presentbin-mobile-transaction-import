export function generateFingerprint(transaction: {
  amount: number;
  currency: string;
  category: string;
  note: string;
  transactionDateTime: bigint;
}): string {
  // Create a deterministic string from stable transaction fields
  const data = `${transaction.amount}|${transaction.currency}|${transaction.category}|${transaction.note}|${transaction.transactionDateTime}`;
  
  // Simple hash function (for production, consider using a proper crypto hash)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `fp_${Math.abs(hash).toString(36)}`;
}

