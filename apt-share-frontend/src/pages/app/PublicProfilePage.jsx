import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchUserRatings } from '../../features/ratings/api';
import axiosClient from '../../lib/axiosClient';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ShieldCheck, Star, Award, ArrowLeft, Calendar } from 'lucide-react';

export const PublicProfilePage = () => {
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const uRes = await axiosClient.get(`/auth/me`);
      setProfileUser(uRes.data);

      const rData = await fetchUserRatings(userId || uRes.data._id);
      setRatings(rData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-text-secondary">
        Loading resident profile...
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
          <span className="font-bold text-base">Resident Trust Profile</span>
          <div></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        {/* User Profile Header Card */}
        <Card elevated className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-accent/20 text-accent font-bold text-2xl flex items-center justify-center border-2 border-accent">
              {profileUser?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-xl font-bold">{profileUser?.name}</h1>
              <p className="text-xs text-text-secondary mt-0.5">{profileUser?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                {profileUser?.trustBadges?.map((badge) => (
                  <Badge key={badge} variant="primary" className="capitalize">
                    {badge?.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-bg-elevated rounded-lg border border-border text-center min-w-[140px]">
            <div className="flex items-center justify-center space-x-1 text-success font-extrabold text-2xl">
              <ShieldCheck className="w-7 h-7" />
              <span>{profileUser?.trustScore || 80}</span>
            </div>
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mt-1 block">
              Trust Score
            </span>
          </div>
        </Card>

        {/* Ratings & Reviews List */}
        <div>
          <h2 className="text-lg font-bold mb-4">Neighbor Feedback & Reviews</h2>
          {ratings.length === 0 ? (
            <Card className="p-8 text-center text-text-secondary text-sm">
              No ratings received yet. Complete borrow cycles to build up neighbor reviews!
            </Card>
          ) : (
            <div className="space-y-4">
              {ratings.map((r) => (
                <Card key={r._id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{r.raterUserId?.name || 'Neighbor'}</span>
                    <div className="flex items-center space-x-1 text-warning">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold text-xs text-text-primary">{r.scores?.overall}/5</span>
                    </div>
                  </div>
                  {r.comment && <p className="text-xs text-text-secondary italic">"{r.comment}"</p>}
                  <p className="text-[10px] text-text-secondary">{new Date(r.createdAt).toLocaleDateString()}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
