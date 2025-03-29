import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import { generateVerificationCode } from '../utils/generateCode.js';
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
    if (!validUser) return next(errorHandler(404, 'User not found'));

    const isPasswordValid = bcryptjs.compareSync(password, validUser.password);
    if (!isPasswordValid) return next(errorHandler(401, 'Wrong credentials'));

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = validUser._doc;

    res
      .cookie('access_token', token, { httpOnly: true })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user._doc;
      res
        .cookie('access_token', token, { httpOnly: true })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

      const newUser = new User({
        username:
          req.body.name.split(' ').join('').toLowerCase() +
          Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });

      await newUser.save();

      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = newUser._doc;
      res
        .cookie('access_token', token, { httpOnly: true })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const signout = async (req, res, next) => {
  try {
    res.clearCookie('access_token');
    res.status(200).json('User has been logged out!');
  } catch (error) {
    next(error);
  }
};
