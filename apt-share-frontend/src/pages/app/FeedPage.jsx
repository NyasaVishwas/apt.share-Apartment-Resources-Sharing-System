import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCommunityFeed } from '../../features/analytics/api';
import { ListingCard } from '../../components/data-display/ListingCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Megaphone, Trophy, Sparkles, Pin } from 'lucide-react';

export const FeedPage = () => {
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const data = await fetchCommunityFeed();
      setFeed(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-text-secondary">
        Loading community feed & recommendations...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col">
      <header className="border-b border-border bg-surface sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <span className="font-bold text-base">Community Feed & Discovery</span>
          <div></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full grid md:grid-cols-12 gap-8">
        {/* Main Feed Column */}
        <div className="md:col-span-8 space-y-8">
          {/* Announcements Card */}
          {feed?.announcements && feed.announcements.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center space-x-2">
                <Megaphone className="w-5 h-5 text-accent" />
                <span>Society Announcements</span>
              </h2>
              {feed.announcements.map((a) => (
                <Card key={a._id} className="p-5 border-accent/40 bg-accent/5">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-base text-text-primary flex items-center space-x-2">
                      {a.pinned && <Pin className="w-4 h-4 text-accent fill-current" />}
                      <span>{a.title}</span>
                    </h3>
                    <Badge variant="primary">Announcement</Badge>
                  </div>
                  <p className="text-sm text-text-secondary mt-2 whitespace-pre-line">{a.body}</p>
                  <span className="text-[10px] text-text-secondary mt-3 block">
                    Posted on {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </Card>
              ))}
            </div>
          )}

          {/* Graph BFS Recommendations */}
          {feed?.recommendations && feed.recommendations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <span>Recommended for You</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {feed.recommendations.map((item) => (
                  <ListingCard key={item._id} listing={item} />
                ))}
              </div>
            </div>
          )}

          {/* Recent Society Activity Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Recent Shared Items</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {feed?.recentListings?.map((item) => (
                <ListingCard key={item._id} listing={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Leaderboard & Top Contributors */}
        <div className="md:col-span-4 space-y-6">
          <Card elevated className="p-5 space-y-4">
            <h3 className="font-bold text-base flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-warning" />
              <span>Top Lenders Leaderboard</span>
            </h3>
            <p className="text-xs text-text-secondary">
              Neighbors with the most completed lend transactions
            </p>

            <div className="space-y-3 pt-2">
              {feed?.topContributors?.length === 0 ? (
                <p className="text-xs text-text-secondary">No completed lends recorded yet.</p>
              ) : (
                feed?.topContributors?.map((tc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-bg-elevated border border-border">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-xs w-5 text-center text-accent">#{idx + 1}</span>
                      <div>
                        <h4 className="font-semibold text-xs text-text-primary">{tc.user?.name}</h4>
                        <span className="text-[10px] text-success font-medium">{tc.user?.trustScore}/100 Trust</span>
                      </div>
                    </div>
                    <Badge variant="success">{tc.completedLends} Lends</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};
