import express from 'express';
import {
  sendVerificationCode,
  verifyCode,
  signup,
  signin,
  googleSignIn,
  signout,
  getMe,
  refreshAccessToken,
} from '../controllers/auth.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/send-code', sendVerificationCode);
router.post('/verify-code', verifyCode);
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google', googleSignIn);
router.get('/signout', signout);
router.get('/me', verifyToken, getMe);
router.get('/refresh', refreshAccessToken);

export default router;
