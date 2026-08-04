const express = require('express');
const ListingsController = require('./listings.controller');
const authenticate = require('../../middlewares/authenticate');
const validateRequest = require('../../middlewares/validateRequest');
const { createListingSchema, updateListingSchema } = require('./listings.validation');

const router = express.Router();

router.use(authenticate);

router.get('/', ListingsController.getListings);
router.post('/', validateRequest(createListingSchema), ListingsController.createListing);
router.get('/mine', ListingsController.getMyListings);
router.get('/:listingId', ListingsController.getListingById);
router.patch('/:listingId', validateRequest(updateListingSchema), ListingsController.updateListing);
router.patch('/:listingId/status', ListingsController.updateListingStatus);

module.exports = router;
