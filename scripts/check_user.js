import { Sequelize } from 'sequelize';
import path from 'path';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(process.cwd(), 'database.sqlite'),
    logging: false
});

async function checkUser() {
    try {
        const [results] = await sequelize.query("SELECT * FROM Users WHERE email = 'seller_test@example.com'");
        console.log('User:', results);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkUser();
