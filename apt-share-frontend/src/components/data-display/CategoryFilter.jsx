import React from 'react';
import { CATEGORIES } from '../../lib/constants';

export const CategoryFilter = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none font-mono">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap uppercase tracking-tight transition-all border ${
              isSelected
                ? 'bg-amber text-ink border-amber shadow-sm'
                : 'bg-surface border-border text-ink-secondary hover:text-ink hover:border-ink-secondary/40'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};
