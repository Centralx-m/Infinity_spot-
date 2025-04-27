import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  additionalInfo?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  iconBgColor,
  iconColor,
  additionalInfo
}: StatsCardProps) {
  const changeColorClass = {
    positive: "text-green-600 dark:text-green-400",
    negative: "text-red-600 dark:text-red-400",
    neutral: "text-slate-600 dark:text-slate-400"
  }[changeType];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-md ${iconBgColor} ${iconColor}`}>
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-slate-900 dark:text-white font-mono">
                {value}
              </div>
              {change && (
                <span className={`ml-2 text-sm font-medium ${changeColorClass}`}>
                  {change}
                </span>
              )}
              {additionalInfo && (
                <span className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                  {additionalInfo}
                </span>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
