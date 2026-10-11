import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 py-1 px-1 mb-2 select-none overflow-x-auto"
    >
      <button
        onClick={items[0]?.onClick}
        className="flex items-center gap-1 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer shrink-0 font-medium"
        title="Início do Melin"
      >
        <Home className="w-3.5 h-3.5 text-rose-500" />
        <span>Melin</span>
      </button>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
          {item.active || !item.onClick ? (
            <span
              className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]"
              aria-current="page"
            >
              {item.label}
            </span>
          ) : (
            <button
              onClick={item.onClick}
              className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer truncate max-w-[140px]"
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
