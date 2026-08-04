import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../features/chat/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Bell, CheckCheck, Clock } from 'lucide-react';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
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
          <span className="font-bold text-base">In-App Notifications</span>
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs">
            <CheckCheck className="w-4 h-4 mr-1 text-accent" />
            <span>Mark All Read</span>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Inbox</h1>
          <p className="text-sm text-text-secondary mt-1">
            Updates on booking requests, QR handoff reminders, and chat messages
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 bg-surface border border-border rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center space-y-3">
            <Bell className="w-12 h-12 text-text-secondary mx-auto" />
            <h3 className="text-lg font-semibold">Inbox Up to Date</h3>
            <p className="text-sm text-text-secondary">You have no new notifications.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <Card
                key={n._id}
                onClick={() => !n.read && handleMarkRead(n._id)}
                className={`p-4 flex items-center justify-between transition-all border ${
                  !n.read ? 'border-accent bg-accent/5' : 'border-border'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${!n.read ? 'bg-accent' : 'bg-transparent'}`} />
                  <div>
                    <h4 className="font-semibold text-sm text-text-primary">{n.title}</h4>
                    <p className="text-xs text-text-secondary mt-0.5">{n.body}</p>
                    <span className="text-[10px] text-text-secondary mt-1 block">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Badge variant={!n.read ? 'primary' : 'default'}>
                  {n.type?.replace('_', ' ')}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
