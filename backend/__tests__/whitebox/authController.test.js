const { registerUser } = require('../../controllers/authController');
const Candidate = require('../../models/Candidate');
const bcrypt = require('bcryptjs');
const generateToken = require('../../utils/generateToken');

jest.mock('../../models/Candidate');
jest.mock('bcryptjs');
jest.mock('../../utils/generateToken');

describe('AuthController - registerUser', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    it('should return 400 if user already exists', async () => {
        User.findOne.mockResolvedValue({ email: 'test@example.com' });

        await registerUser(req, res);

        expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });

    it('should register a new user successfully', async () => {
        User.findOne.mockResolvedValue(null);
        bcrypt.genSalt.mockResolvedValue('salt');
        bcrypt.hash.mockResolvedValue('hashedPassword');
        User.create.mockResolvedValue({
            _id: 'userid',
            name: 'Test User',
            email: 'test@example.com',
            role: 'candidate'
        });
        generateToken.mockReturnValue('mockedToken');

        await registerUser(req, res);

        expect(User.create).toHaveBeenCalledWith({
            name: 'Test User',
            email: 'test@example.com',
            password: 'hashedPassword',
            role: 'candidate'
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            _id: 'userid',
            name: 'Test User',
            email: 'test@example.com',
            role: 'candidate',
            token: 'mockedToken'
        });
    });
});
