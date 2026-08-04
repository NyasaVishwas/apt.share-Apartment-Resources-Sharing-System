/**
 * Report Generator Helper
 * Generates formatted CSV summary strings for community inventory, bookings, and audit reports.
 */
class ReportGenerator {
  static generateInventoryCSV(listings) {
    const headers = ['Listing ID', 'Title', 'Category', 'Security Deposit (INR)', 'Rental Fee/Day (INR)', 'Status', 'Average Rating'];
    const rows = listings.map((item) => [
      item._id.toString(),
      `"${item.title.replace(/"/g, '""')}"`,
      item.category,
      item.securityDeposit,
      item.rentalFeePerDay,
      item.status,
      item.averageRating || 0
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  static generateBookingsCSV(bookings) {
    const headers = ['Booking ID', 'Item Title', 'Borrower Email', 'Start Date', 'End Date', 'Status', 'Deposit Status'];
    const rows = bookings.map((b) => [
      b._id.toString(),
      `"${(b.listingId?.title || 'Resource').replace(/"/g, '""')}"`,
      b.borrowerId?.email || 'N/A',
      new Date(b.startDate).toISOString().slice(0, 10),
      new Date(b.endDate).toISOString().slice(0, 10),
      b.status,
      b.depositStatus
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

module.exports = ReportGenerator;
