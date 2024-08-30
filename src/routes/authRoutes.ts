import express from 'express';
import { register, login } from '../controllers/authController';
import auth from '../middleware/auth';
import { body } from 'express-validator';

const router = express.Router();

router.post(
    '/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
    ],
    register
);

router.post(
    '/login',
    [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
    login
);

router.get('/protected', auth, (req, res) => res.send('Access granted'));

export default router;
