const generateToken = require('../../utils/generateToken');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('generateToken', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = 'testsecret';
        process.env.JWT_EXPIRE = '30d';
    });

    it('should call jwt.sign with correct arguments', () => {
        const userId = 'user123';
        generateToken(userId);

        expect(jwt.sign).toHaveBeenCalledWith(
            { id: userId },
            'testsecret',
            { expiresIn: '30d' }
        );
    });

    it('should return a token', () => {
        jwt.sign.mockReturnValue('mocked_token');
        const token = generateToken('user123');
        expect(token).toBe('mocked_token');
    });
});
