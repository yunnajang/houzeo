import express from 'express';
import {
  sendVerificationCode,
  verifyCode,
  signup,
  signin,
  googleSignIn,
  signout,
  refreshAccessToken,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/send-code', sendVerificationCode);
router.post('/verify-code', verifyCode);
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google', googleSignIn);
router.post('/signout', signout);
router.get('/refresh', refreshAccessToken);

export default router;
