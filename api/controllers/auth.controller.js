import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import { generateVerificationCode } from '../utils/generateCode.js';
import admin from '../utils/firebaseAdmin.js';
import sendEmail from '../utils/sendEmail.js';

export const sendVerificationCode = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return next(errorHandler(400, 'All fields are required.'));
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const message =
        existingUser.email === email
          ? 'Email is already registered.'
          : 'Username is already taken.';
      return next(errorHandler(409, message));
    }

    const strongPasswordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      return next(
        errorHandler(
          400,
          'Password must be at least 8 characters and include a number, a letter, and a special character.'
        )
      );
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    global.verificationStore = global.verificationStore || {};
    global.verificationStore[email] = {
      verificationCode,
      verificationCodeExpires,
      username,
      password,
    };

    await sendEmail({
      to: email,
      subject: 'Houzeo Email Verification Code',
      html: `
        <p>Welcome, ${username} 👋</p>
        <p>Your verification code is:</p>
        <h2>${verificationCode}</h2>
        <p>This code will expire in 10 minutes.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to email.',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyAndSignup = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return next(errorHandler(400, 'Email and code are required.'));
    }

    const stored = global.verificationStore?.[email];

    if (
      !stored ||
      stored.verificationCode !== code ||
      new Date() > stored.verificationCodeExpires
    ) {
      return next(errorHandler(400, 'Invalid or expired verification code.'));
    }

    const already = await User.findOne({ email });
    if (already) {
      return next(errorHandler(409, 'This email is already registered.'));
    }

    const hashedPassword = bcryptjs.hashSync(stored.password, 10);
    const newUser = new User({
      email,
      username: stored.username,
      password: hashedPassword,
    });

    await newUser.save();

    delete global.verificationStore[email];

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(401, 'Invalid email or password'));

    if (user.fromGoogle) {
      return next(errorHandler(400, 'Please sign in with Google.'));
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
      sameSite: 'None',
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
    });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const googleSignIn = async (req, res, next) => {
  const { idToken } = req.body;
  console.log(idToken);

  try {
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
      sameSite: 'None',
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
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

    res.status(200).json(user);
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
      sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
    });

    res.status(200).json({ message: 'Access token refreshed' });
  });
};
