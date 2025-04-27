import { useLocation } from "wouter";
import { LayoutGrid, LayoutList, LineChart, Settings } from "lucide-react";

export function MobileNav() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 md:hidden">
      <div className="flex justify-around">
        <a 
          href="/" 
          className={`flex flex-col items-center py-3 px-2 ${
            isActive("/") ? "text-primary" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <LayoutGrid className="w-6 h-6" />
          <span className="text-xs mt-1">Dashboard</span>
        </a>
        <a 
          href="/bots"
          className={`flex flex-col items-center py-3 px-2 ${
            isActive("/bots") ? "text-primary" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <LayoutList className="w-6 h-6" />
          <span className="text-xs mt-1">Bots</span>
        </a>
        <a 
          href="/transactions"
          className={`flex flex-col items-center py-3 px-2 ${
            isActive("/transactions") ? "text-primary" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <LineChart className="w-6 h-6" />
          <span className="text-xs mt-1">Transactions</span>
        </a>
        <a 
          href="/api-settings"
          className={`flex flex-col items-center py-3 px-2 ${
            isActive("/api-settings") ? "text-primary" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <Settings className="w-6 h-6" />
          <span className="text-xs mt-1">Settings</span>
        </a>
      </div>
    </div>
  );
}
