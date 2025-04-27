import { useLocation } from "wouter";
import { 
  LayoutGrid, 
  LayoutList, 
  LineChart, 
  Wallet, 
  Settings, 
  ShieldCheck
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <aside className="bg-white dark:bg-slate-800 md:w-64 md:fixed md:h-screen md:flex-shrink-0 border-r border-slate-200 dark:border-slate-700 hidden md:block">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
          </svg>
          <h1 className="text-xl font-semibold">GridTrader Pro</h1>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-6 mb-4 text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">
          Main
        </div>
        <a 
          href="/"
          className={`flex items-center px-6 py-3 ${
            isActive("/") 
              ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700"
              : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition duration-150"
          }`}
        >
          <LayoutGrid className="w-5 h-5 mr-3" />
          Dashboard
        </a>
        <a 
          href="/bots"
          className={`flex items-center px-6 py-3 ${
            isActive("/bots") 
              ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700"
              : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition duration-150"
          }`}
        >
          <LayoutList className="w-5 h-5 mr-3" />
          Trading Bots
        </a>
        <a 
          href="/transactions"
          className={`flex items-center px-6 py-3 ${
            isActive("/transactions") 
              ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700"
              : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition duration-150"
          }`}
        >
          <LineChart className="w-5 h-5 mr-3" />
          Transactions
        </a>

        <div className="px-6 my-4 text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">
          Settings
        </div>
        <a 
          href="/api-settings"
          className={`flex items-center px-6 py-3 ${
            isActive("/api-settings") 
              ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700"
              : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition duration-150"
          }`}
        >
          <Settings className="w-5 h-5 mr-3" />
          API Settings
        </a>
        <a 
          href="#"
          className="flex items-center px-6 py-3 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition duration-150"
        >
          <ShieldCheck className="w-5 h-5 mr-3" />
          Security
        </a>
        <a 
          href="#"
          className="flex items-center px-6 py-3 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition duration-150"
        >
          <Wallet className="w-5 h-5 mr-3" />
          Backup & Recovery
        </a>
      </nav>
    </aside>
  );
}
