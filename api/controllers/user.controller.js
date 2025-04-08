import Listing from '../models/listing.model.js';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/errorHandler.js';
import { userUpdateSchema } from '../validation/userUpdateSchema.js';
import bcryptjs from 'bcryptjs';

export const updateUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (userId !== req.params.id) {
      return next(errorHandler(401, 'You can only update your own account!'));
    }
    const { username, email, avatar } = req.body;

    await userUpdateSchema.validate({ username, email });

    const currentUser = await User.findById(userId);
    if (!currentUser) return next(errorHandler(404, 'User not found'));

    if (username !== currentUser.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername)
        return next(errorHandler(409, 'Username is already taken'));
    }

    if (email !== currentUser.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail)
        return next(errorHandler(409, 'Email is already registered'));
    }

    currentUser.username = username;
    currentUser.email = email;
    if (avatar) currentUser.avatar = avatar;

    await currentUser.save();

    res.status(200).json({
      id: currentUser._id,
      username: currentUser.username,
      email: currentUser.email,
      avatar: currentUser.avatar,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(errorHandler(400, error.message));
    }
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (userId !== req.params.id) {
      return next(errorHandler(401, 'You can only delete your own account!'));
    }

    const user = await User.findById(userId);
    if (!user) return next(errorHandler(404, 'User not found'));

    await User.findByIdAndDelete(userId);

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });

    res.status(200).json({ message: 'Account successfully deleted' });
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only view your own listings'));
  try {
    const listings = await Listing.find({ userRef: req.params.id });
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return next(errorHandler(404, 'User not found'));

    const { password: pass, ...rest } = user._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return next(errorHandler(404, 'User not found'));

    res.status(200).json({
      id: user._id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
    });
  } catch (error) {
    next(error);
  }
};
