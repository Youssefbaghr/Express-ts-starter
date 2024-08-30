import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

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

export const sendVerificationEmail = async (user: IUser) => {
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    const transporter = nodemailer.createTransport({
        // Configure your email service here
    });

    await transporter.sendMail({
        to: user.email,
        subject: 'Verify your email',
        html: `Click <a href="${process.env.BASE_URL}/verify-email/${verificationToken}">here</a> to verify your email.`,
    });
};

export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
        return res.status(400).send({ error: 'Invalid verification token' });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.send({ message: 'Email verified successfully' });
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).send({ error: 'User not found' });
    }
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const transporter = nodemailer.createTransport({
        // Configure your email service here
    });

    await transporter.sendMail({
        to: user.email,
        subject: 'Password Reset',
        html: `Click <a href="${process.env.BASE_URL}/reset-password/${resetToken}">here</a> to reset your password.`,
    });

    res.send({ message: 'Password reset email sent' });
};

export const resetPassword = async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
        return res
            .status(400)
            .send({ error: 'Invalid or expired reset token' });
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.send({ message: 'Password reset successfully' });
};

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).send({ error: 'Refresh token required' });
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET!
        ) as { userId: string };
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET!,
            { expiresIn: '15m' }
        );
        res.send({ accessToken });
    } catch (error) {
        res.status(403).send({ error: 'Invalid refresh token' });
    }
};
