import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, ShieldCheck, ArrowRight, Sun, Moon, Check, Sparkles, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Logo } from '../../components/ui/Logo';
import { useTheme } from '../../app/providers/ThemeProvider';

export const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans selection:bg-amber selection:text-ink">
      {/* Navigation Header */}
      <header className="border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-surface-sunken text-ink-secondary hover:text-ink transition-colors border border-transparent hover:border-border"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/login">
              <Button variant="ghost" size="md">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="md">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section with Core Artifact */}
      <section className="pt-12 pb-20 px-6 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-surface-sunken border border-border text-ink-secondary text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse"></span>
              <span>RESIDENTIAL RESOURCE CHECK-OUT LEDGER</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-ink leading-[1.1]">
              Borrow More. <br />
              <span className="italic font-normal text-ink-secondary">Buy Less.</span>
            </h1>

            <p className="text-lg text-ink-secondary max-w-xl leading-relaxed">
              A private library card catalog for your apartment complex. Share high-value ladders, drills, camping gear, and cameras through QR-verified handoffs, deposit holds, and neighbor trust scores.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link to="/register">
                <Button size="lg" variant="primary" className="w-full sm:w-auto px-8">
                  Join Your Building Ledger <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore Demo Complex
                </Button>
              </Link>
            </div>

            {/* Micro verification highlights */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-mono text-ink-secondary border-t border-border/60">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal" /> Address Verified Only
              </span>
              <span className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber" /> QR Handoff Verification
              </span>
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-teal" /> Zero Rental Fees
              </span>
            </div>
          </div>

          {/* Right Column: Hero Core Artifact — Realistic Borrow Ticket */}
          <div className="lg:col-span-5">
            <div className="ledger-ticket p-6 shadow-ticket relative overflow-hidden bg-surface">
              {/* Header metadata */}
              <div className="flex items-center justify-between pb-4 border-b border-border text-xs font-mono">
                <span className="text-ink-secondary tracking-wider uppercase font-semibold">
                  APT.SHARE // CHECK-OUT TICKET
                </span>
                <span className="text-ink font-bold">REF: #BRW-8942</span>
              </div>

              {/* Borrow item detail */}
              <div className="py-5 flex items-start gap-4">
                <div className="w-16 h-16 rounded-md bg-surface-sunken border border-border flex items-center justify-center shrink-0 text-2xl font-serif">
                  ⚙️
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-teal bg-teal/10 px-1.5 py-0.5 rounded border border-teal/30">
                    VERIFIED LISTING
                  </span>
                  <h3 className="font-serif font-bold text-lg text-ink">Kärcher 1800 PSI Pressure Washer</h3>
                  <p className="text-xs text-ink-secondary font-sans">Includes 25ft hose, foam cannon & turbo nozzle</p>
                </div>
              </div>

              {/* Handoff Route & Schedule Ledger */}
              <div className="bg-surface-sunken p-4 rounded-md border border-border space-y-2 font-mono text-xs my-2">
                <div className="flex justify-between items-center text-ink-secondary">
                  <span>BORROWER:</span>
                  <span className="text-ink font-medium flex items-center gap-1">
                    Flat ██ (P████ M.)
                  </span>
                </div>
                <div className="flex justify-between items-center text-ink-secondary">
                  <span>LENDER:</span>
                  <span className="text-ink font-medium flex items-center gap-1">
                    Flat ██ (D████ S.)
                  </span>
                </div>
                <div className="flex justify-between items-center text-ink-secondary pt-1 border-t border-border/60">
                  <span>DEPOSIT HOLD:</span>
                  <span className="text-ink font-bold">₹1,500 (Escrow)</span>
                </div>
                <div className="flex justify-between items-center text-ink-secondary">
                  <span>DUE RETURN:</span>
                  <span className="text-amber font-bold">Sat, 8 Aug 2026, 6:00 PM</span>
                </div>
              </div>

              {/* Perforated ticket divider */}
              <div className="ticket-divider"></div>

              {/* Footer status & QR stamp */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <QrCode className="w-8 h-8 text-ink-secondary" />
                  <div className="text-[11px] font-mono text-ink-secondary leading-tight">
                    <span>HANDOFF STATUS</span>
                    <br />
                    <span className="text-ink font-bold">QR VERIFIED PICKUP</span>
                  </div>
                </div>

                <div className="stamp-badge stamp-badge-amber animate-stamp-thud">
                  CONFIRMED & ISSUED
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Ledger Totals (Printed Summary Receipt) */}
      <section className="py-12 bg-surface-sunken border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-ink-secondary">AUDITED RESIDENTIAL IMPACT</span>
            <h2 className="text-2xl font-serif font-bold text-ink">Community Ledger Totals</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface border border-border p-5 rounded-lg text-center font-mono">
              <span className="text-xs text-ink-secondary uppercase tracking-wider block mb-1">Items Shared</span>
              <span className="text-3xl md:text-4xl font-serif font-bold text-ink">1,482</span>
              <span className="text-[10px] text-teal block mt-1">↑ 14% this month</span>
            </div>

            <div className="bg-surface border border-border p-5 rounded-lg text-center font-mono">
              <span className="text-xs text-ink-secondary uppercase tracking-wider block mb-1">Money Saved</span>
              <span className="text-3xl md:text-4xl font-serif font-bold text-amber">₹4.29 Lakh</span>
              <span className="text-[10px] text-ink-secondary block mt-1">Across 8 societies</span>
            </div>

            <div className="bg-surface border border-border p-5 rounded-lg text-center font-mono">
              <span className="text-xs text-ink-secondary uppercase tracking-wider block mb-1">CO₂ Prevented</span>
              <span className="text-3xl md:text-4xl font-serif font-bold text-teal">3.4 Tons</span>
              <span className="text-[10px] text-teal block mt-1">Avoided purchases</span>
            </div>

            <div className="bg-surface border border-border p-5 rounded-lg text-center font-mono">
              <span className="text-xs text-ink-secondary uppercase tracking-wider block mb-1">Active Ledger Users</span>
              <span className="text-3xl md:text-4xl font-serif font-bold text-ink">94.8%</span>
              <span className="text-[10px] text-ink-secondary block mt-1">Verified return rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works: Ledger Line-Items */}
      <section className="py-20 max-w-5xl mx-auto px-6 w-full">
        <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-ink-secondary">THE BORROW LOOP</span>
          <h2 className="text-3xl font-serif font-bold text-ink">How the Building Ledger Works</h2>
          <p className="text-sm text-ink-secondary">Four disciplined steps to borrow anything from your neighbors without awkwardness.</p>
        </div>

        <div className="space-y-4">
          {/* Step 1 */}
          <div className="bg-surface border border-border rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-ink-secondary/40 transition-colors">
            <div className="flex items-start gap-4">
              <span className="font-mono text-xl font-bold text-amber bg-amber/10 px-3 py-1 rounded border border-amber/30 shrink-0">
                01
              </span>
              <div>
                <h3 className="font-serif font-bold text-lg text-ink mb-1">Browse Catalog & Place Request</h3>
                <p className="text-sm text-ink-secondary">
                  Search tools, camp gear, and appliances listed exclusively by verified residents in your building or campus. Select start and return dates.
                </p>
              </div>
            </div>
            <div className="font-mono text-xs text-ink-secondary border-l border-border pl-4 hidden md:block shrink-0">
              ENTRY TYPE: REQUEST
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-surface border border-border rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-ink-secondary/40 transition-colors">
            <div className="flex items-start gap-4">
              <span className="font-mono text-xl font-bold text-amber bg-amber/10 px-3 py-1 rounded border border-amber/30 shrink-0">
                02
              </span>
              <div>
                <h3 className="font-serif font-bold text-lg text-ink mb-1">Lender Approval & Deposit Hold</h3>
                <p className="text-sm text-ink-secondary">
                  Lender receives the request tag and approves. Optional security deposit is held safely in escrow until item is returned intact.
                </p>
              </div>
            </div>
            <div className="font-mono text-xs text-ink-secondary border-l border-border pl-4 hidden md:block shrink-0">
              ENTRY TYPE: APPROVAL
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-surface border border-border rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-ink-secondary/40 transition-colors">
            <div className="flex items-start gap-4">
              <span className="font-mono text-xl font-bold text-teal bg-teal/10 px-3 py-1 rounded border border-teal/30 shrink-0">
                03
              </span>
              <div>
                <h3 className="font-serif font-bold text-lg text-ink mb-1">Doorstep QR Pickup & Return Stamp</h3>
                <p className="text-sm text-ink-secondary">
                  Meet at your neighbor's door. Scan the dynamic QR code on pickup and again on return. Pre and post condition photos confirm zero damage.
                </p>
              </div>
            </div>
            <div className="font-mono text-xs text-ink-secondary border-l border-border pl-4 hidden md:block shrink-0">
              ENTRY TYPE: QR SCAN
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-surface border border-border rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-ink-secondary/40 transition-colors">
            <div className="flex items-start gap-4">
              <span className="font-mono text-xl font-bold text-teal bg-teal/10 px-3 py-1 rounded border border-teal/30 shrink-0">
                04
              </span>
              <div>
                <h3 className="font-serif font-bold text-lg text-ink mb-1">Deposit Release & Trust Rating</h3>
                <p className="text-sm text-ink-secondary">
                  Upon return scan confirmation, deposit is released back instantly and both neighbors exchange trust score badges for the ledger.
                </p>
              </div>
            </div>
            <div className="font-mono text-xs text-ink-secondary border-l border-border pl-4 hidden md:block shrink-0">
              ENTRY TYPE: RELEASE
            </div>
          </div>
        </div>
      </section>

      {/* Neighbor Testimonials */}
      <section className="py-16 bg-surface-sunken border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-ink-secondary">RESIDENT LOGBOOK</span>
            <h2 className="text-2xl font-serif font-bold text-ink">From Your Neighbors</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Quote 1 */}
            <div className="bg-surface border border-border p-6 rounded-lg space-y-4 flex flex-col justify-between">
              <p className="text-sm text-ink font-serif italic leading-relaxed">
                "Needed a 12ft step ladder to replace high hallway bulbs. Took 3 minutes to find one in Block B, scan the QR code at the elevator, and return it."
              </p>
              <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="font-bold text-ink block">Ananya Rao</span>
                  <span className="text-ink-secondary">Oakridge Residency</span>
                </div>
                <Badge variant="teal">VERIFIED BORROWER</Badge>
              </div>
            </div>

            {/* Quote 2 */}
            <div className="bg-surface border border-border p-6 rounded-lg space-y-4 flex flex-col justify-between">
              <p className="text-sm text-ink font-serif italic leading-relaxed">
                "I had a DeWalt drill sitting in my closet 360 days a year. Now 6 neighbors have used it, and I've built a 98% community trust score."
              </p>
              <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="font-bold text-ink block">Vikram Desai</span>
                  <span className="text-ink-secondary">Shanti Nagar Society</span>
                </div>
                <Badge variant="amber">ACTIVE LENDER</Badge>
              </div>
            </div>

            {/* Quote 3 */}
            <div className="bg-surface border border-border p-6 rounded-lg space-y-4 flex flex-col justify-between">
              <p className="text-sm text-ink font-serif italic leading-relaxed">
                "The escrow deposit and QR photo proof mean I never have to worry about gear getting damaged or lost. It just works seamlessly."
              </p>
              <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="font-bold text-ink block">Siddharth & Meera</span>
                  <span className="text-ink-secondary">Lakeview Residency</span>
                </div>
                <Badge variant="teal">TRUSTED MEMBER</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-ink">
          Ready to open your building's lending ledger?
        </h2>
        <p className="text-ink-secondary max-w-lg mx-auto text-sm">
          Join hundreds of residents borrowing tools, sports equipment, and household items right in their own apartment building.
        </p>
        <div className="pt-2 flex justify-center">
          <Link to="/register">
            <Button size="lg" variant="primary" className="px-10">
              Register Your Apartment <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-surface text-center text-xs font-mono text-ink-secondary">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 apt.share — Neighborhood Resource Ledger System.</div>
          <div className="flex items-center space-x-6">
            <Link to="/login" className="hover:text-ink">Sign In</Link>
            <Link to="/register" className="hover:text-ink">Register Complex</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

