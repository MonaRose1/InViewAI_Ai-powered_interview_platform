const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/authRoutes');
const Candidate = require('../../models/Candidate');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Mock the User model methods globally for this integration test
// In a real black box test, we might interact with a real DB, but for speed/safety we mock the DB layer.
jest.mock('../../models/Candidate');
jest.mock('../../utils/generateToken', () => () => 'mock_token');
// We do NOT mock the controller itself, so we test the route->controller flow.

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should register a user and return 201', async () => {
            // Setup Mongoose mock
            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({
                _id: '123',
                name: 'New User',
                email: 'new@example.com',
                password: 'hashed',
                role: 'candidate'
            });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'New User',
                    email: 'new@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body.email).toEqual('new@example.com');
        });

        it('should fail if user exists', async () => {
            User.findOne.mockResolvedValue({ email: 'existing@example.com' });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Existing',
                    email: 'existing@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual('User already exists');
        });
    });
});
