import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { SALT_ROUNDS } from '../config/constants';

export interface IUser extends Document {
    email: string;
    password: string;
    isVerified: boolean;
    verificationToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Number;
}

const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Number,
});
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    }
    next();
});

export default mongoose.model<IUser>('User', userSchema);
