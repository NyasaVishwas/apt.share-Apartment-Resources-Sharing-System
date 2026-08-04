import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, QrCode, Heart, ArrowRight, Sun, Moon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../app/providers/ThemeProvider';

export const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-xl">
              a
            </div>
            <span className="font-bold text-xl tracking-tight">apt.share</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-6 mx-auto">
          <span>✨ Gated Community Sharing Platform</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Borrow More. <span className="text-accent">Buy Less.</span>
        </h1>
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10">
          Share high-value tools, appliances, camping gear, and electronics safely within your apartment, society, or campus using QR-verified handoffs and trust ratings.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto">
              Join Your Community <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Explore Demo Account
            </Button>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 text-left mt-12">
          <div className="p-6 bg-surface border border-border rounded-lg shadow-sm">
            <div className="w-10 h-10 rounded-md bg-accent/10 text-accent flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Hard Community Boundary</h3>
            <p className="text-sm text-text-secondary">
              Listings are visible only to verified residents of your apartment or society — no random strangers.
            </p>
          </div>

          <div className="p-6 bg-surface border border-border rounded-lg shadow-sm">
            <div className="w-10 h-10 rounded-md bg-accent/10 text-accent flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">QR Verified Pickup & Return</h3>
            <p className="text-sm text-text-secondary">
              Scan dynamic QR codes during handoffs to log exact pickup/return timestamps and pre/post photo proof.
            </p>
          </div>

          <div className="p-6 bg-surface border border-border rounded-lg shadow-sm">
            <div className="w-10 h-10 rounded-md bg-accent/10 text-accent flex items-center justify-center mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Trust Score & Deposit Ledger</h3>
            <p className="text-sm text-text-secondary">
              Build neighbor trust with transparent rating scores, deposit holds, and community admin dispute resolution.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-text-secondary">
        <p>© 2026 apt.share. All rights reserved.</p>
      </footer>
    </div>
  );
};
