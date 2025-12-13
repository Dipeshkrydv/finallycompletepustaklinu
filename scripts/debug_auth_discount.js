import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';
import bcrypt from 'bcrypt';
import { User, Book } from '../src/models/index.js'; // Adjust path if needed or redefine models here for isolation if imports are tricky

// Direct Sequelize setup to avoid import chaos if models use special env vars
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(process.cwd(), 'database.sqlite'),
    logging: false
});

// We need to verify if the imported models are attached to this sequelize instance automatically
// or if we need to manually define them for the script.
// Given models/index.js structure, it likely initializes them. 
// However, src/models/index.js imports from local files.
// Let's try importing index.js. If it fails, I'll inline the model defs.

async function run() {
    try {
        console.log('--- DEBUG START ---');

        // 1. Test Login Logic
        const email = 'seller_test2@example.com';
        const password = 'password123';
        console.log(`Testing Login for ${email}`);

        // Manual query to ensure we aren't relying on Model if Model is broken
        const [rawUsers] = await sequelize.query(`SELECT * FROM Users WHERE email = '${email}'`);
        if (rawUsers.length === 0) {
            console.log('FAIL: User not found in DB (Raw Query)');
        } else {
            console.log('User found (Raw Query):', rawUsers[0].email);
            const user = rawUsers[0];

            const isValid = await bcrypt.compare(password, user.password);
            console.log(`Password valid? ${isValid}`);
        }

        // 2. Test Discount Logic (using Model if possible, or Raw Insert)
        // Let's try to verify if 50 becomes 47.
        // We'll insert a raw record first to check SQLite behavior.
        console.log('\nTesting Discount Storage (Raw SQL)');
        await sequelize.query(`INSERT INTO Books (title, category, price, pages, discount, description, sellerId, createdAt, updatedAt) VALUES ('Test Book SQL', 'Test', 1000, 100, 50, 'Desc', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`);

        const [books] = await sequelize.query(`SELECT * FROM Books WHERE title = 'Test Book SQL' ORDER BY id DESC LIMIT 1`);
        console.log('Raw Insert check:', books[0]); // expect 50

        // Now strict integer check
        if (books[0].discount === 50) {
            console.log('SUCCESS: Raw SQL stored 50 as 50');
        } else {
            console.log(`FAIL: Raw SQL stored 50 as ${books[0].discount}`);
        }

        // Cleanup
        await sequelize.query(`DELETE FROM Books WHERE title = 'Test Book SQL'`);

    } catch (error) {
        console.error('Script Error:', error);
    } finally {
        await sequelize.close();
    }
}

run();
