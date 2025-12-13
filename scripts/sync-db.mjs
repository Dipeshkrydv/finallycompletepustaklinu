import sequelize from '../src/lib/db.js';
import '../src/models/index.js'; // Ensure models are loaded

const syncDb = async () => {
  try {
    console.log('Syncing database...');
    await sequelize.sync({ force: true });
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
  } finally {
    await sequelize.close();
  }
};

syncDb();
