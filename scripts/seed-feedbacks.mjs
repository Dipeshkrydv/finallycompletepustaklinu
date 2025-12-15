import sequelize from '../src/lib/db.js';
import { Feedback, User } from '../src/models/index.js';
import bcrypt from 'bcrypt';

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Create some dummy users for reviews
        const password = await bcrypt.hash('password', 10);
        const users = [];
        const names = ['Aarav Patel', 'Diya Sharma', 'Rohan Gupta', 'Ananya Singh', 'Vihaan Kumar', 'Ishita Verma', 'Aditya Joshi', 'Kavya Reddy', 'Arjun Malhotra', 'Saanvi Nair'];

        for (const name of names) {
            // Check if user exists or create
            const email = `${name.toLowerCase().replace(' ', '.')}@example.com`;
            let user = await User.findOne({ where: { email } });
            if (!user) {
                user = await User.create({
                    name,
                    email,
                    password,
                    role: 'buyer',
                    phone: Math.floor(Math.random() * 9000000000) + 1000000000
                });
            }
            users.push(user);
        }

        // Create Feedbacks
        const comments = [
            "This platform changed how I buy books! So affordable.",
            "Sold my old textbooks in a day. Super easy process.",
            "Love the sustainability aspect. Keep it up!",
            "Great collection of rare books. Found exactly what I needed.",
            "The seller was very polite and the book was in mint condition.",
            "User interface is very clean and easy to use.",
            "Email notifications are very helpful.",
            "Standard delivery time, but great packaging.",
            "I've saved so much money buying used books here.",
            "Highly recommended for all students!",
            "Pustaklinu is the best thing to happen to book lovers.",
            "Finally a trusted place to exchange books."
        ];

        console.log('Seeding feedbacks...');

        for (let i = 0; i < comments.length; i++) {
            const user = users[i % users.length];
            await Feedback.create({
                userId: user.id,
                rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
                comment: comments[i],
                isPublic: true
            });
        }

        console.log('Seeding complete!');
        process.exit(0);

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
