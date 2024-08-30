import express from 'express';
import { register, login } from '../controllers/authController';
import auth from '../middleware/auth';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

router.post(
    '/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
    ],
    validateRequest,
    register
);

router.post(
    '/login',
    [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
    validateRequest,
    login
);

router.get('/protected', auth, (req, res) => res.send('Access granted'));

export default router;
