const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./modules/auth/auth.routes');
const communityRoutes = require('./modules/communities/communities.routes');
const membershipRoutes = require('./modules/memberships/memberships.routes');
const listingRoutes = require('./modules/listings/listings.routes');
const wishlistRoutes = require('./modules/wishlist/wishlist.routes');
const bookingRoutes = require('./modules/bookings/bookings.routes');
const ratingRoutes = require('./modules/ratings/ratings.routes');
const damageReportRoutes = require('./modules/damageReports/damageReports.routes');
const chatRoutes = require('./modules/chat/chat.routes');
const notificationRoutes = require('./modules/notifications/notifications.routes');
const feedRoutes = require('./modules/feed/feed.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const platformRoutes = require('./modules/platform/platform.routes');
const helmet = require('helmet');
const { authLimiter, apiLimiter } = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const ApiResponse = require('./utils/ApiResponse');

const app = express();

// Security & Cors Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiting
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1', apiLimiter);

// Health Check Probe
app.get('/health', (req, res) => {
  res.status(200).json(
    new ApiResponse(200, {
      status: 'UP',
      timestamp: new Date(),
      uptime: process.uptime()
    })
  );
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/communities', communityRoutes);
app.use('/api/v1/memberships', membershipRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/ratings', ratingRoutes);
app.use('/api/v1/damage-reports', damageReportRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/feed', feedRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/platform', platformRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
