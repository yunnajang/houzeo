import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandler(404, 'Listing not found'));
  }

  if (req.user.id !== listing.userRef) {
    return next(errorHandler(404, 'You can only delete your own listing'));
  }

  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json('Listing has been deleted');
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) return next(errorHandler(404, 'Listing not found'));

  if (req.user.id !== listing.userRef)
    return next(errorHandler(401, 'You can only update your own listing'));

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) return next(errorHandler(404, 'Listing not found'));

    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    if (limit < 0 || startIndex < 0) {
      return next(errorHandler(400, 'Invalid pagination parameters'));
    }

    const parseBooleanQuery = (value) =>
      value === 'true' ? true : { $in: [true, false] };

    const offer = parseBooleanQuery(req.query.offer);
    const furnished = parseBooleanQuery(req.query.furnished);
    const parking = parseBooleanQuery(req.query.parking);

    const validTypes = ['sale', 'rent'];
    let type = req.query.type;
    if (!type || !validTypes.includes(type)) {
      type = { $in: validTypes };
    }

    const query = {
      offer,
      furnished,
      parking,
      type,
    };

    const searchTerm = req.query.searchTerm;
    if (searchTerm) {
      query.address = { $regex: searchTerm, $options: 'i' };
    }

    const allowedSortFields = ['createdAt', 'regularPrice'];
    const sortField = allowedSortFields.includes(req.query.sort)
      ? req.query.sort
      : 'createdAt';
    const sortOrder = ['asc', 'desc'].includes(req.query.order)
      ? req.query.order
      : 'desc';

    const listings = await Listing.find(query)
      .sort({ [sortField]: sortOrder })
      .limit(limit)
      .skip(startIndex);
    console.log(listings);
    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
