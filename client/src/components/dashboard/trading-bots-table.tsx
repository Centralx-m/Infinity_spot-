import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { GridBotStats, TradingBot } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  SiEthereum, 
  SiBitcoin, 
  SiSolana, 
  SiBinance, 
  SiXrp 
} from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { ApiKeyNotice } from "./api-key-notice";

const getCryptoIcon = (pair: string) => {
  switch (pair.split('/')[0]) {
    case 'BTC':
      return <SiBitcoin className="h-8 w-8 text-amber-500" />;
    case 'ETH':
      return <SiEthereum className="h-8 w-8 text-slate-500" />;
    case 'SOL':
      return <SiSolana className="h-8 w-8 text-purple-500" />;
    case 'BNB':
      return <SiBinance className="h-8 w-8 text-yellow-500" />;
    case 'XRP':
      return <SiXrp className="h-8 w-8 text-blue-500" />;
    default:
      return <SiBitcoin className="h-8 w-8 text-amber-500" />;
  }
};

export function TradingBotsTable() {
  const { toast } = useToast();
  
  const { data: bots = [], isLoading } = useQuery<TradingBot[]>({
    queryKey: ['/api/bots'],
  });
  
  const toggleBotMutation = useMutation({
    mutationFn: async (botId: number) => {
      return apiRequest('POST', `/api/bots/${botId}/toggle`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Success",
        description: "Bot status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update bot status: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const handleToggleBot = (botId: number) => {
    toggleBotMutation.mutate(botId);
  };
  
  return (
    <div>
      <ApiKeyNotice />
      
      <Card className="mb-8">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="text-lg">Active Trading Bots</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bot Name</TableHead>
                <TableHead>Trading Pair</TableHead>
                <TableHead>Grid Range</TableHead>
                <TableHead>Grid Lines</TableHead>
                <TableHead>Profit (24h)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Loading active bots...
                  </TableCell>
                </TableRow>
              ) : bots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No active bots found. Create a new bot to get started.
                  </TableCell>
                </TableRow>
              ) : (
                bots.map((bot: TradingBot) => (
                  <TableRow key={bot.id}>
                    <TableCell>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {bot.name}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Created {new Date(bot.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 mr-2">
                          {getCryptoIcon(bot.tradingPair)}
                        </div>
                        <span className="font-mono text-sm text-slate-900 dark:text-white">
                          {bot.tradingPair}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm text-slate-900 dark:text-white">
                        ${Number(bot.lowerPrice).toFixed(2)} - ${Number(bot.upperPrice).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-900 dark:text-white">{bot.gridLines}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-accent">
                        {/* @ts-ignore - stats property will be added later */}
                        {bot.stats ? (
                          <>+${bot.stats.profit24h.toFixed(2)} ({bot.stats.profit24hPercentage.toFixed(2)}%)</>
                        ) : (
                          'Calculating...'
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        bot.isActive 
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300" 
                          : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300"
                      }`}>
                        {bot.isActive ? 'Active' : 'Stopped'}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      <Button variant="ghost" className="text-primary hover:text-primary-dark font-medium mr-3">
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        className={bot.isActive ? "text-danger hover:text-red-700 font-medium" : "text-accent hover:text-green-700 font-medium"}
                        onClick={() => handleToggleBot(bot.id)}
                        disabled={toggleBotMutation.isPending}
                      >
                        {bot.isActive ? 'Stop' : 'Start'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}