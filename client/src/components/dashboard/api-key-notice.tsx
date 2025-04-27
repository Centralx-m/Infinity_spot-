import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiKey } from "@shared/schema";

export function ApiKeyNotice() {
  const { data: apiKeys, isLoading } = useQuery<ApiKey[]>({
    queryKey: ['/api/keys'],
  });

  if (isLoading) return null;

  // If there are API keys, don't show the notice
  if (apiKeys && apiKeys.length > 0) return null;

  return (
    <Alert className="mb-6 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
      <AlertTitle className="text-amber-800 dark:text-amber-200 flex items-center text-base font-medium">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 mr-2"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        API Access Required
      </AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300 mt-2">
        <p className="mb-3">
          To use the trading bot, you need to add your Bitget API keys. Without API keys, you can't access market data or create trading bots.
        </p>
        <Button asChild variant="default" className="bg-amber-600 hover:bg-amber-700 text-white border-none">
          <Link href="/api-settings">
            Add API Keys
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}