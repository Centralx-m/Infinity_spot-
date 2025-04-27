import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useGridCalculator } from "@/lib/hooks/use-grid-calculator";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

// Create a schema for form validation
const createBotSchema = z.object({
  name: z.string().min(1, "Bot name is required"),
  tradingPair: z.string().min(1, "Trading pair is required"),
  investmentAmount: z.coerce.number().min(10, "Investment must be at least 10 USDT"),
  apiKeyId: z.coerce.number().min(1, "API key is required"),
  gridType: z.enum(["arithmetic", "geometric"]),
  upperPrice: z.coerce.number().min(0, "Upper price is required"),
  lowerPrice: z.coerce.number().min(0, "Lower price is required"),
  gridLines: z.coerce.number().min(5, "Must have at least 5 grid lines").max(100, "Cannot exceed 100 grid lines"),
  profitPerGrid: z.coerce.number().min(0.1, "Profit per grid must be at least 0.1%"),
  isActive: z.boolean().default(true)
});

type CreateBotFormValues = z.infer<typeof createBotSchema>;

export function CreateBotForm() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  const { control, handleSubmit, watch, formState: { errors } } = useForm<CreateBotFormValues>({
    resolver: zodResolver(createBotSchema),
    defaultValues: {
      name: "",
      tradingPair: "BTCUSDT",
      investmentAmount: 100,
      apiKeyId: 0,
      gridType: "geometric",
      upperPrice: 0,
      lowerPrice: 0,
      gridLines: 20,
      profitPerGrid: 0.53,
      isActive: true
    }
  });
  
  // Get current values from form for live calculations
  const tradingPair = watch("tradingPair");
  const lowerPrice = watch("lowerPrice");
  const upperPrice = watch("upperPrice");
  const gridLines = watch("gridLines");
  const profitPerGrid = watch("profitPerGrid");
  const investmentAmount = watch("investmentAmount");
  
  // Fetch API keys
  const { data: apiKeys = [] } = useQuery({
    queryKey: ['/api/keys'],
  });
  
  // Get current ticker information to set default price range
  const { data: tickerData } = useQuery({
    queryKey: ['/api/market', tradingPair, 'ticker'],
    queryFn: async ({ queryKey }) => {
      const [, symbol] = queryKey;
      const response = await fetch(`/api/market/${symbol}/ticker`);
      if (!response.ok) throw new Error('Failed to fetch ticker data');
      return response.json();
    },
    enabled: !!tradingPair,
  });
  
  // Calculate grid statistics
  const { dailyProfit, monthlyProfit, dailyProfitPercentage, monthlyProfitPercentage } = useGridCalculator({
    lowerPrice,
    upperPrice,
    gridLines,
    profitPerGrid,
    investmentAmount
  });
  
  // Create bot mutation
  const createBotMutation = useMutation({
    mutationFn: async (data: CreateBotFormValues) => {
      return apiRequest('POST', '/api/bots', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bot created successfully",
      });
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create bot: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: CreateBotFormValues) => {
    createBotMutation.mutate(data);
  };
  
  return (
    <Card className="mb-8">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Create New Grid Bot</CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium text-slate-900 dark:text-white mb-4">Trading Parameters</h3>
                  
                  <div className="mb-4">
                    <Label htmlFor="name">Bot Name</Label>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input id="name" {...field} className="mt-1" />
                      )}
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <Label htmlFor="tradingPair">Trading Pair</Label>
                    <Controller
                      name="tradingPair"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select Trading Pair" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                            <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
                            <SelectItem value="SOLUSDT">SOL/USDT</SelectItem>
                            <SelectItem value="BNBUSDT">BNB/USDT</SelectItem>
                            <SelectItem value="XRPUSDT">XRP/USDT</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.tradingPair && (
                      <p className="text-red-600 text-sm mt-1">{errors.tradingPair.message}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <Label htmlFor="investmentAmount">Investment Amount (USDT)</Label>
                    <Controller
                      name="investmentAmount"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="investmentAmount"
                          type="number"
                          {...field}
                          className="mt-1"
                        />
                      )}
                    />
                    {errors.investmentAmount && (
                      <p className="text-red-600 text-sm mt-1">{errors.investmentAmount.message}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <Label htmlFor="apiKeyId">API Key</Label>
                    <Controller
                      name="apiKeyId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select API Key" />
                          </SelectTrigger>
                          <SelectContent>
                            {apiKeys.length === 0 ? (
                              <SelectItem value="0" disabled>No API keys available</SelectItem>
                            ) : (
                              apiKeys.map((key: any) => (
                                <SelectItem key={key.id} value={key.id.toString()}>
                                  {key.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.apiKeyId && (
                      <p className="text-red-600 text-sm mt-1">{errors.apiKeyId.message}</p>
                    )}
                    {apiKeys.length === 0 && (
                      <p className="text-amber-600 text-sm mt-1">
                        Please add an API key in the API Settings page first.
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-slate-900 dark:text-white mb-4">Grid Configuration</h3>
                  
                  <div className="mb-4">
                    <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Grid Type</Label>
                    <Controller
                      name="gridType"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="arithmetic" id="arithmetic" />
                            <Label htmlFor="arithmetic">Arithmetic</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="geometric" id="geometric" />
                            <Label htmlFor="geometric">Geometric</Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <Label htmlFor="upperPrice">Upper Price Limit</Label>
                    <Controller
                      name="upperPrice"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="upperPrice"
                          type="number"
                          step="0.01"
                          {...field}
                          className="mt-1"
                        />
                      )}
                    />
                    {errors.upperPrice && (
                      <p className="text-red-600 text-sm mt-1">{errors.upperPrice.message}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <Label htmlFor="lowerPrice">Lower Price Limit</Label>
                    <Controller
                      name="lowerPrice"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="lowerPrice"
                          type="number"
                          step="0.01"
                          {...field}
                          className="mt-1"
                        />
                      )}
                    />
                    {errors.lowerPrice && (
                      <p className="text-red-600 text-sm mt-1">{errors.lowerPrice.message}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <Label htmlFor="gridLines">Number of Grid Lines</Label>
                    <Controller
                      name="gridLines"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="gridLines"
                          type="number"
                          min="5"
                          max="100"
                          {...field}
                          className="mt-1"
                        />
                      )}
                    />
                    {errors.gridLines && (
                      <p className="text-red-600 text-sm mt-1">{errors.gridLines.message}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Profit per Grid (%)
                    </Label>
                    <div className="text-2xl font-semibold text-primary font-mono">
                      {profitPerGrid}%
                    </div>
                    <Controller
                      name="profitPerGrid"
                      control={control}
                      render={({ field }) => (
                        <Slider
                          value={[field.value]}
                          min={0.1}
                          max={2}
                          step={0.01}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="mt-2"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h4 className="font-medium text-slate-900 dark:text-white">Estimated Performance</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Based on current market conditions</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="text-sm text-slate-500 dark:text-slate-400">Daily Profit (Est.)</div>
                      <div className="text-lg font-semibold text-accent">
                        ${dailyProfit.toFixed(2)} ({dailyProfitPercentage.toFixed(2)}%)
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="text-sm text-slate-500 dark:text-slate-400">Monthly Profit (Est.)</div>
                      <div className="text-lg font-semibold text-accent">
                        ${monthlyProfit.toFixed(2)} ({monthlyProfitPercentage.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mr-3"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createBotMutation.isPending || apiKeys.length === 0}
                >
                  {createBotMutation.isPending ? "Creating..." : "Create & Start Bot"}
                </Button>
              </div>
            </form>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
