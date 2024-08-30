import request from 'supertest';
import app from '../app';
import User from '../models/User';
import mongoose from 'mongoose';

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI!);
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Auth API', () => {
    it('should register a new user', async () => {
        const res = await request(app).post('/api/auth/register').send({
            email: 'test@example.com',
            password: 'password123',
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty(
            'message',
            'User registered successfully'
        );
    });

    // Add more tests for login, email verification, password reset, etc.
});
