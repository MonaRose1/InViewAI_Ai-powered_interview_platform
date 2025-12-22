const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('../models/Question');

dotenv.config({ path: '../.env' });

const questions = [
    {
        text: "What is the difference between Virtual DOM and Real DOM in React?",
        type: 'text',
        category: 'Technical',
        difficulty: 'Medium'
    },
    {
        text: "Explain the concept of closures in JavaScript and provide an example.",
        type: 'text',
        category: 'Technical',
        difficulty: 'Hard'
    },
    {
        text: "Which of the following is NOT a built-in React hook?",
        type: 'mcq',
        options: ['useState', 'useEffect', 'useAction', 'useRef'],
        correctAnswer: 'useAction',
        category: 'Technical',
        difficulty: 'Easy'
    },
    {
        text: "Tell me about a time you faced a conflict in a team. How did you resolve it?",
        type: 'text',
        category: 'Soft Skills',
        difficulty: 'Medium'
    },
    {
        text: "What is the purpose of 'Redux' in large applications?",
        type: 'text',
        category: 'Technical',
        difficulty: 'Medium'
    },
    {
        text: "What does the 'spread operator' (...) do in JavaScript?",
        type: 'mcq',
        options: ['Combines objects', 'Deletes properties', 'Creates a shallow copy', 'None of the above'],
        correctAnswer: 'Creates a shallow copy',
        category: 'Technical',
        difficulty: 'Easy'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interviewer');
        console.log('Connected to MongoDB');

        // Remove existing questions to avoid duplicates
        await Question.deleteMany({});
        console.log('Old questions removed');

        await Question.insertMany(questions);
        console.log('Database seeded successfully!');

        process.exit();
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDB();
