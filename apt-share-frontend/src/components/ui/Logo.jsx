import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = ({ showTagline = true, to = '/', className = '' }) => {
  const content = (
    <div className={`flex items-center space-x-3 group ${className}`}>
      <div className="w-8 h-8 rounded bg-ink flex items-center justify-center text-bg font-serif font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
        a
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="font-serif font-bold text-xl tracking-tight text-ink">apt.share</span>
        {showTagline && (
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink-secondary hidden sm:inline-block border-l border-border pl-2">
            Residential Ledger
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-block focus:outline-none focus:ring-2 focus:ring-amber/50 rounded">
        {content}
      </Link>
    );
  }

  return content;
};
