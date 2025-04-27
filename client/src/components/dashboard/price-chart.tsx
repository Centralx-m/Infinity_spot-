import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createChart, ColorType, CrosshairMode, LineStyle } from "lightweight-charts";
import { usePriceData } from "@/lib/hooks/use-price-data";
import { PriceCandle } from "@shared/schema";
import { ApiKeyNotice } from "./api-key-notice";

interface PriceChartProps {
  defaultSymbol?: string;
  defaultTimeframe?: string;
}

export function PriceChart({ 
  defaultSymbol = "BTCUSDT", 
  defaultTimeframe = "1d" 
}: PriceChartProps) {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [timeframe, setTimeframe] = useState(defaultTimeframe);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const gridLinesRef = useRef<any[]>([]);
  
  const { data: priceData, isLoading } = usePriceData(symbol, timeframe) as { data: PriceCandle[] | undefined, isLoading: boolean };
  
  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    // Clean up previous chart instance if it exists
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }
    
    const chartOptions = {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      grid: {
        vertLines: {
          color: 'rgba(100, 116, 139, 0.1)',
        },
        horzLines: {
          color: 'rgba(100, 116, 139, 0.1)',
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      timeScale: {
        borderColor: 'rgba(100, 116, 139, 0.2)',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: 'rgba(100, 116, 139, 0.2)',
      },
    };
    
    try {
      // Create the chart
      chartRef.current = createChart(chartContainerRef.current, chartOptions);
      
      // Add candlestick series
      seriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#22c55e',
        wickDownColor: '#ef4444',
        wickUpColor: '#22c55e',
      });
      
      // Handle resize
      const handleResize = () => {
        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth
          });
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
          seriesRef.current = null;
        }
      };
    } catch (error) {
      console.error("Error initializing chart:", error);
    }
  }, []);
  
  // Update price data
  useEffect(() => {
    if (!seriesRef.current || !priceData || priceData.length === 0) return;
    
    // Format data for the chart
    const formattedData = priceData.map((candle: PriceCandle) => ({
      time: candle.time / 1000, // convert from milliseconds to seconds
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close
    }));
    
    seriesRef.current.setData(formattedData);
    
    // Fit content to see all data
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [priceData]);
  
  // Add grid lines to the chart for a sample bot
  const addGridLinesToChart = (lowerPrice: number, upperPrice: number, gridCount: number) => {
    if (!chartRef.current || !seriesRef.current) return;
    
    // Clear existing grid lines
    if (gridLinesRef.current && gridLinesRef.current.length > 0) {
      gridLinesRef.current.forEach(line => {
        try {
          if (line && chartRef.current) {
            chartRef.current.removePriceLine(line);
          }
        } catch (error) {
          console.error("Error removing price line:", error);
        }
      });
      gridLinesRef.current = [];
    }
    
    // Create new grid lines
    const step = (upperPrice - lowerPrice) / (gridCount - 1);
    
    try {
      for (let i = 0; i < gridCount; i++) {
        const price = lowerPrice + step * i;
        const line = seriesRef.current.createPriceLine({
          price,
          color: '#2563eb',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: `Grid ${i + 1}`,
        });
        
        gridLinesRef.current.push(line);
      }
    } catch (error) {
      console.error("Error creating grid lines:", error);
    }
  };
  
  // Add some example grid lines for demonstration
  useEffect(() => {
    if (!seriesRef.current || !priceData || priceData.length === 0) return;
    
    // Wait for next tick to ensure chart is rendered
    setTimeout(() => {
      try {
        const lastCandle = priceData[priceData.length - 1] as PriceCandle;
        if (!lastCandle) return;
        
        const lastPrice = lastCandle.close;
        const lowerPrice = lastPrice * 0.9; // 10% below current price
        const upperPrice = lastPrice * 1.1; // 10% above current price
        addGridLinesToChart(lowerPrice, upperPrice, 10);
      } catch (error) {
        console.error("Error setting up grid lines:", error);
      }
    }, 100);
  }, [priceData]);
  
  return (
    <>
      <ApiKeyNotice />
      
      <Card className="mb-8">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap items-center justify-between">
            <div className="mb-4 md:mb-0">
              <CardTitle className="text-lg">{symbol} Price Chart</CardTitle>
              <CardDescription>Real-time price data with grid levels</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Select value={symbol} onValueChange={setSymbol}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select symbol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                  <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
                  <SelectItem value="SOLUSDT">SOL/USDT</SelectItem>
                  <SelectItem value="BNBUSDT">BNB/USDT</SelectItem>
                  <SelectItem value="XRPUSDT">XRP/USDT</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">1D</SelectItem>
                  <SelectItem value="4h">4H</SelectItem>
                  <SelectItem value="1h">1H</SelectItem>
                  <SelectItem value="15m">15M</SelectItem>
                  <SelectItem value="5m">5M</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="w-full h-[400px]" ref={chartContainerRef}>
            {isLoading && (
              <div className="h-full flex items-center justify-center text-slate-500">
                Loading price data...
              </div>
            )}
            {!isLoading && (!priceData || priceData.length === 0) && (
              <div className="h-full flex items-center justify-center text-slate-500">
                No price data available. Please add an API key to access market data.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
