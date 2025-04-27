import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TransactionsTable({ limit = 5 }: { limit?: number }) {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['/api/transactions', { limit }],
    queryFn: async ({ queryKey }) => {
      const [url, { limit }] = queryKey as [string, { limit?: number }];
      const response = await fetch(`${url}?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Card className="mb-8">
      <CardHeader className="border-b border-slate-200 dark:border-slate-700">
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Bot</TableHead>
              <TableHead>Trading Pair</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx: Transaction) => (
                <TableRow key={tx.id}>
                  <TableCell className="whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {formatDate(tx.timestamp.toString())}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-slate-900 dark:text-white">
                    Bot #{tx.botId}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-mono text-sm text-slate-900 dark:text-white">
                        {tx.tradingPair}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge 
                      variant={tx.type === "buy" ? "success" : "destructive"}
                      className="px-2 text-xs font-semibold"
                    >
                      {tx.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="font-mono text-sm text-slate-900 dark:text-white">
                      ${Number(tx.price).toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="font-mono text-sm text-slate-900 dark:text-white">
                      {Number(tx.amount).toFixed(4)} {tx.tradingPair.split('/')[0]}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="font-mono text-sm text-slate-900 dark:text-white">
                      ${Number(tx.value).toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="font-mono text-sm text-accent">
                      {tx.profit ? `+$${Number(tx.profit).toFixed(2)}` : "-"}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <CardFooter className="border-t border-slate-200 dark:border-slate-700 py-4 text-right">
        <Button variant="link" className="text-primary hover:text-blue-700 text-sm" asChild>
          <a href="/transactions">View All Transactions →</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
