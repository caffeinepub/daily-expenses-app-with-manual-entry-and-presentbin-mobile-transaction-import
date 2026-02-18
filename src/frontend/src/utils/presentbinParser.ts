import type { PresentbinTransaction } from '../backend';
import { generateFingerprint } from './fingerprint';

export function parsePresentbinData(jsonData: string): PresentbinTransaction[] {
  let data: any;

  try {
    data = JSON.parse(jsonData);
  } catch (error) {
    throw new Error('Invalid JSON format. Please check your input.');
  }

  if (!Array.isArray(data)) {
    throw new Error('Expected an array of transactions.');
  }

  const transactions: PresentbinTransaction[] = [];
  const errors: string[] = [];

  data.forEach((item, index) => {
    try {
      // Validate required fields
      if (typeof item.amount !== 'number' || item.amount <= 0) {
        throw new Error(`Transaction ${index + 1}: Invalid or missing amount (must be a positive number in cents)`);
      }

      if (!item.currency || typeof item.currency !== 'string') {
        throw new Error(`Transaction ${index + 1}: Missing or invalid currency`);
      }

      if (!item.category || typeof item.category !== 'string') {
        throw new Error(`Transaction ${index + 1}: Missing or invalid category`);
      }

      if (!item.note || typeof item.note !== 'string') {
        throw new Error(`Transaction ${index + 1}: Missing or invalid note`);
      }

      // Parse transaction date/time
      let transactionDateTime: bigint;
      if (typeof item.transactionDateTime === 'string') {
        const date = new Date(item.transactionDateTime);
        if (isNaN(date.getTime())) {
          throw new Error(`Transaction ${index + 1}: Invalid date format`);
        }
        transactionDateTime = BigInt(date.getTime()) * BigInt(1_000_000);
      } else if (typeof item.transactionDateTime === 'number') {
        transactionDateTime = BigInt(item.transactionDateTime);
      } else {
        throw new Error(`Transaction ${index + 1}: Missing or invalid transactionDateTime`);
      }

      // Generate fingerprint for deduplication
      const fingerprint = generateFingerprint({
        amount: item.amount,
        currency: item.currency,
        category: item.category,
        note: item.note,
        transactionDateTime,
      });

      transactions.push({
        amount: item.amount,
        currency: item.currency,
        category: item.category,
        note: item.note,
        transactionDateTime,
        fingerprint,
      });
    } catch (error: any) {
      errors.push(error.message);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Parsing errors:\n${errors.join('\n')}`);
  }

  if (transactions.length === 0) {
    throw new Error('No valid transactions found in the input data.');
  }

  return transactions;
}

