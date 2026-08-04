const ListingsService = require('./listings.service');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');

class ListingsController {
  static getListings = asyncHandler(async (req, res) => {
    const communityId = req.headers['x-community-id'];
    if (!communityId) {
      throw new ApiError(400, 'X-Community-Id header is required', 'COMMUNITY_REQUIRED');
    }

    const { listings, meta } = await ListingsService.getListings(communityId, req.query);
    res.status(200).json(new ApiResponse(200, listings, 'Listings fetched successfully', meta));
  });

  static createListing = asyncHandler(async (req, res) => {
    const communityId = req.headers['x-community-id'];
    if (!communityId) {
      throw new ApiError(400, 'X-Community-Id header is required', 'COMMUNITY_REQUIRED');
    }

    const listing = await ListingsService.createListing(req.user._id, communityId, req.body);
    res.status(201).json(new ApiResponse(201, listing, 'Listing created successfully'));
  });

  static getMyListings = asyncHandler(async (req, res) => {
    const communityId = req.headers['x-community-id'];
    const listings = await ListingsService.getMyListings(req.user._id, communityId);
    res.status(200).json(new ApiResponse(200, listings));
  });

  static getListingById = asyncHandler(async (req, res) => {
    const listing = await ListingsService.getListingById(req.params.listingId);
    res.status(200).json(new ApiResponse(200, listing));
  });

  static updateListing = asyncHandler(async (req, res) => {
    const listing = await ListingsService.updateListing(req.params.listingId, req.user._id, req.body);
    res.status(200).json(new ApiResponse(200, listing, 'Listing updated successfully'));
  });

  static updateListingStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const listing = await ListingsService.updateListingStatus(req.params.listingId, req.user._id, status);
    res.status(200).json(new ApiResponse(200, listing, `Listing status updated to ${status}`));
  });
}

module.exports = ListingsController;
