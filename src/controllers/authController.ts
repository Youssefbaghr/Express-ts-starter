import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const register = async (req: Request, res: Response) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).send({ error: error.message });
        } else {
            res.status(500).send({ error: 'An unexpected error occurred' });
        }
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (
            !user ||
            !(await bcrypt.compare(req.body.password, user.password))
        ) {
            return res.status(401).send({ error: 'Invalid login credentials' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
            expiresIn: '1h',
        });
        res.send({ token });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).send({ error: error.message });
        } else {
            res.status(500).send({ error: 'An unexpected error occurred' });
        }
    }
};
