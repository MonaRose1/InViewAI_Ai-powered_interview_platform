const request = require('supertest');
const express = require('express');

const app = express();
app.get('/', (req, res) => {
    res.send('AI Interviewer API is running');
});

describe('GET /', () => {
    it('should return 200 and the welcome message', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toBe('AI Interviewer API is running');
    });
});
