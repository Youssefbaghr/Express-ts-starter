import express from 'express';
import { register, login } from '../controllers/authController';
import auth from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/protected', auth, (req, res) => res.send('Access granted'));

export default router;
