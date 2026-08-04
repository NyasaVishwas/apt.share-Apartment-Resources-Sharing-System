import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchThreads } from '../../features/chat/api';
import { useAuth } from '../../app/providers/AuthProvider';
import { Card } from '../../components/ui/Card';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export const ChatListPage = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      const data = await fetchThreads();
      setThreads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col">
      <header className="border-b border-border bg-surface sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <span className="font-bold text-base">Resident Chat Threads</span>
          <div></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages & Inquiries</h1>
          <p className="text-sm text-text-secondary mt-1">
            Direct real-time communication with neighbors for pickups and item inquiries
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="h-20 bg-surface border border-border rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : threads.length === 0 ? (
          <Card className="p-12 text-center space-y-3">
            <MessageSquare className="w-12 h-12 text-text-secondary mx-auto" />
            <h3 className="text-lg font-semibold">No Message Threads Yet</h3>
            <p className="text-sm text-text-secondary">
              Start an inquiry on any shared listing to message the owner directly.
            </p>
            <Link to="/browse" className="inline-block pt-2">
              <span className="text-xs font-semibold text-accent hover:underline">Browse Inventory</span>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {threads.map((t) => {
              const otherParticipant = t.participantIds?.find((p) => p._id?.toString() !== user?._id?.toString());
              return (
                <Link key={t._id} to={`/chat/${t._id}`}>
                  <Card className="p-4 flex items-center justify-between hover:border-accent group transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-sm border border-accent/30">
                        {otherParticipant?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm group-hover:text-accent transition-colors">
                          {otherParticipant?.name || 'Neighbor'}
                        </h4>
                        <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">
                          {t.lastMessagePreview || 'No messages yet.'}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] text-text-secondary whitespace-nowrap">
                      {new Date(t.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
