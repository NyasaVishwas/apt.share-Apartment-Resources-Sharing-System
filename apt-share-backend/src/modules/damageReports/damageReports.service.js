const DamageReport = require('../../models/DamageReport.model');
const Booking = require('../../models/Booking.model');
const User = require('../../models/User.model');
const AuditLog = require('../../models/AuditLog.model');
const TrustScoreEvent = require('../../models/TrustScoreEvent.model');
const ApiError = require('../../utils/ApiError');

class DamageReportsService {
  static async createReport(reporterUserId, reportData) {
    const { bookingId, description, photos } = reportData;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, 'Booking not found', 'NOT_FOUND');
    }

    const isOwner = booking.ownerId.toString() === reporterUserId.toString();
    const isBorrower = booking.borrowerId.toString() === reporterUserId.toString();

    if (!isOwner && !isBorrower) {
      throw new ApiError(403, 'Only booking participants can file a damage report', 'FORBIDDEN');
    }

    const againstUserId = isOwner ? booking.borrowerId : booking.ownerId;

    const report = await DamageReport.create({
      bookingId,
      communityId: booking.communityId,
      reportedByUserId: reporterUserId,
      againstUserId,
      description,
      photos: photos || [{ url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80' }],
      status: 'open'
    });

    // Mark booking & deposit as disputed
    booking.status = 'disputed';
    booking.depositStatus = 'disputed';
    await booking.save();

    return report;
  }

  static async getCommunityReports(communityId) {
    return await DamageReport.find({ communityId })
      .sort({ createdAt: -1 })
      .populate('reportedByUserId', 'name email avatarUrl trustScore')
      .populate('againstUserId', 'name email avatarUrl trustScore')
      .populate({
        path: 'bookingId',
        populate: { path: 'listingId', select: 'title category securityDeposit' }
      });
  }

  static async getReportById(reportId) {
    const report = await DamageReport.findById(reportId)
      .populate('reportedByUserId', 'name email avatarUrl trustScore')
      .populate('againstUserId', 'name email avatarUrl trustScore')
      .populate({
        path: 'bookingId',
        populate: { path: 'listingId' }
      });

    if (!report) {
      throw new ApiError(404, 'Damage report not found', 'NOT_FOUND');
    }

    return report;
  }

  static async resolveReport(reportId, adminUser, resolutionData) {
    const { decision, resolutionAmount, note } = resolutionData; // decision: 'deduct' | 'dismiss'

    const report = await DamageReport.findById(reportId);
    if (!report) {
      throw new ApiError(404, 'Damage report not found', 'NOT_FOUND');
    }

    const booking = await Booking.findById(report.bookingId);

    if (decision === 'deduct') {
      report.status = 'resolved_deducted';
      report.resolutionAmount = resolutionAmount || booking.depositAmount;

      if (booking) {
        booking.depositStatus = 'deducted';
        booking.depositDeductionAmount = report.resolutionAmount;
        booking.status = 'completed';
        await booking.save();
      }

      // Deduct Trust Score of responsible user
      await TrustScoreEvent.create({
        userId: report.againstUserId,
        communityId: report.communityId,
        eventType: 'damage_incident',
        scoreDelta: -10,
        relatedBookingId: report.bookingId
      });

      const user = await User.findById(report.againstUserId);
      if (user) {
        user.trustScore = Math.max(0, user.trustScore - 10);
        await user.save();
      }
    } else {
      report.status = 'resolved_dismissed';
      if (booking) {
        booking.depositStatus = 'released';
        booking.status = 'completed';
        await booking.save();
      }
    }

    report.resolvedByUserId = adminUser._id;
    report.resolutionNote = note || '';
    report.resolvedAt = new Date();
    await report.save();

    // Immutable Audit Log entry
    await AuditLog.create({
      communityId: report.communityId,
      actorUserId: adminUser._id,
      actorRole: adminUser.role,
      action: 'dispute.resolved',
      targetEntityType: 'DamageReport',
      targetEntityId: report._id,
      metadata: {
        decision,
        resolutionAmount: report.resolutionAmount,
        note
      }
    });

    return report;
  }
}

module.exports = DamageReportsService;
