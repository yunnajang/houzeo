import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { errorHandler } from '../utils/errorHandler.js';
import admin from '../utils/firebaseAdmin.js';
import redisClient from '../lib/redisClient.js';
import User from '../models/user.model.js';
import { signupSchema } from '../validation/signupSchema.js';
import { emailOnlySchema } from '../validation/emailOnlySchema.js';

export const sendVerificationCode = async (req, res, next) => {
  try {
    await emailOnlySchema.validate(req.body);

    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.fromGoogle) {
        return next(
          errorHandler(
            400,
            'This email is registered via Google. Please sign in with Google.'
          )
        );
      } else {
        return next(errorHandler(400, 'Email is already registered'));
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.set(`verifyCode:${email}`, code, { EX: 300 });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Houzeo Email Verification Code',
      html: `
        <p>Your verification code is:</p>
        <h2>${code}</h2>
        <p>This code will expire in 5 minutes.</p>
      `,
    });

    return res.status(200).json({ message: 'Verification code sent to email' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(errorHandler(400, error.message));
    }
    next(error);
  }
};

export const verifyCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!code) return next(errorHandler(400, 'Verification code is required'));

    const storedCode = await redisClient.get(`verifyCode:${email}`);
    if (!storedCode || storedCode !== code)
      return next(errorHandler(400, 'Invalid or expired verification code.'));

    await redisClient.set(`verifiedEmail:${email}`, 'true', { EX: 600 });

    res
      .status(200)
      .json({ message: 'Your email has been successfully verified' });
  } catch (error) {
    next(error);
  }
};

export const signup = async (req, res, next) => {
  try {
    await signupSchema.validate(req.body);

    const { username, email, password } = req.body;

    const isVerified = await redisClient.get(`verifiedEmail:${email}`);
    if (!isVerified)
      return next(
        errorHandler(400, 'Email verification required before signing up')
      );

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.fromGoogle) {
        return next(
          errorHandler(
            400,
            'This email is registered via Google. Please sign in with Google.'
          )
        );
      } else {
        return next(errorHandler(400, 'Email is already registered'));
      }
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    await redisClient.del(`verifyCode:${email}`);
    await redisClient.del(`verifiedEmail:${email}`);

    res.status(201).json({ message: 'Sign up successful' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(errorHandler(400, error.message));
    }
    next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;

    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(401, 'Invalid email or password'));

    if (validUser.fromGoogle) {
      return next(
        errorHandler(
          400,
          'This email is registered via Google. Please sign in with Google'
        )
      );
    }

    const isPasswordValid = await bcryptjs.compare(
      password,
      validUser.password
    );
    if (!isPasswordValid)
      return next(errorHandler(401, 'Invalid email or password'));

    const accessToken = jwt.sign(
      { id: validUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: validUser._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    const user = {
      id: validUser._id,
      email: validUser.email,
      username: validUser.username,
      avatar: validUser.avatar,
    };

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const googleSignIn = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        username: `${name}${Math.floor(Math.random() * 10000)}`,
        avatar: picture,
        fromGoogle: true,
      });

      await user.save();
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });

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

export const signout = async (req, res, next) => {
  try {
    res
      .clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      })
      .status(200)
      .json({ message: 'Logged out successfully' });
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

export const refreshAccessToken = (req, res, next) => {
  const token = req.cookies.refresh_token;
  if (!token) return next(errorHandler(401, 'Not authenticated'));

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) return next(errorHandler(403, 'Refresh token invalid'));

    const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });

    res.status(200).json({ message: 'Access token refreshed' });
  });
};
