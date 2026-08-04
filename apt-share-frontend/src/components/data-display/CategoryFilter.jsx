import React from 'react';
import { CATEGORIES } from '../../lib/constants';

export const CategoryFilter = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              isSelected
                ? 'bg-accent text-white border-accent shadow-sm'
                : 'bg-surface border-border text-text-secondary hover:text-text-primary hover:border-text-secondary/40'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};
