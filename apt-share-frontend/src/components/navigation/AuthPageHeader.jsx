import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { useTheme } from '../../app/providers/ThemeProvider';
import { ArrowLeft, Sun, Moon } from 'lucide-react';

export const AuthPageHeader = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleBackClick = (e) => {
    e.preventDefault();
    if (window.history.length > 1 && document.referrer && document.referrer.includes(window.location.host)) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm font-mono">
      {/* Left Group: Literal Unmissable Back Button + Working Logo Link */}
      <div className="flex items-center space-x-6">
        <button
          onClick={handleBackClick}
          className="inline-flex items-center space-x-1.5 text-xs text-ink-secondary hover:text-ink transition-colors group focus:outline-none focus:ring-2 focus:ring-amber/50 rounded py-1 px-2.5 border border-border/60 hover:border-border bg-surface-sunken/60"
          title="Return to homepage or previous page"
        >
          <ArrowLeft className="w-4 h-4 text-ink-secondary group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-bold tracking-wider uppercase">BACK</span>
        </button>

        <Logo to="/" />
      </div>

      {/* Right Group: Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-md hover:bg-surface-sunken text-ink-secondary hover:text-ink transition-colors border border-transparent hover:border-border"
        title="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </header>
  );
};
