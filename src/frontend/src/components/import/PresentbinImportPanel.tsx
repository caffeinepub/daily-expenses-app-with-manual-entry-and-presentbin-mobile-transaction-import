import { useState } from 'react';
import { useImportPresentbinTransactions } from '../../hooks/useExpenses';
import { parsePresentbinData } from '../../utils/presentbinParser';
import type { PresentbinTransaction } from '../../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, FileUp, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/dates';
import { toast } from 'sonner';

export default function PresentbinImportPanel() {
  const [pasteData, setPasteData] = useState('');
  const [parsedTransactions, setParsedTransactions] = useState<PresentbinTransaction[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<{ imported: number; skipped: number; failed: number } | null>(null);

  const importMutation = useImportPresentbinTransactions();

  const handleParse = () => {
    setParseError(null);
    setImportSummary(null);

    try {
      const transactions = parsePresentbinData(pasteData);
      setParsedTransactions(transactions);
      toast.success(`Parsed ${transactions.length} transactions`);
    } catch (error: any) {
      setParseError(error.message);
      setParsedTransactions([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPasteData(content);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedTransactions.length === 0) return;

    try {
      const result = await importMutation.mutateAsync(parsedTransactions);
      setImportSummary({
        imported: Number(result.imported),
        skipped: Number(result.skippedDuplicates),
        failed: Number(result.failed),
      });
      toast.success(`Imported ${result.imported} transactions`);
      setParsedTransactions([]);
      setPasteData('');
    } catch (error) {
      toast.error('Failed to import transactions');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import from Presentbin Mobile
          </CardTitle>
          <CardDescription>
            Paste JSON data or upload a file containing your Presentbin transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Expected Format</AlertTitle>
            <AlertDescription>
              Each transaction should include: <strong>amount</strong> (in cents), <strong>currency</strong>, <strong>category</strong>, <strong>note</strong>, and <strong>transactionDateTime</strong> (ISO string or timestamp).
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label className="text-sm font-medium">Paste JSON Data</label>
            <Textarea
              placeholder='[{"amount": 1250, "currency": "USD", "category": "Food", "note": "Lunch", "transactionDateTime": "2024-01-15T12:30:00Z"}]'
              value={pasteData}
              onChange={(e) => setPasteData(e.target.value)}
              rows={8}
              className="font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors">
                  <FileUp className="w-4 h-4" />
                  <span className="text-sm">Upload JSON File</span>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <Button onClick={handleParse} disabled={!pasteData.trim()}>
              Parse Data
            </Button>
          </div>

          {parseError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Parse Error</AlertTitle>
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          )}

          {importSummary && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Import Complete</AlertTitle>
              <AlertDescription>
                Imported: {importSummary.imported} · Skipped (duplicates): {importSummary.skipped} · Failed: {importSummary.failed}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {parsedTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Transactions</CardTitle>
            <CardDescription>
              Review {parsedTransactions.length} transactions before importing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedTransactions.map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {formatDateTime(transaction.transactionDateTime)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{transaction.category}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{transaction.note}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button
              onClick={handleImport}
              disabled={importMutation.isPending}
              className="w-full gap-2"
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import {parsedTransactions.length} Transactions
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

