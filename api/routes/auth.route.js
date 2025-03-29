import express from 'express';
import {
  sendVerificationCode,
  verifyAndSignup,
  signin,
  google,
  signout,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/verify/send-code', sendVerificationCode);
router.post('/verify/confirm', verifyAndSignup);
router.post('/signin', signin);
router.post('/google', google);
router.get('/signout', signout);

export default router;
