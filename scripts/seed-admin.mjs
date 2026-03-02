import sequelize from '../src/lib/db.js';
import bcrypt from 'bcryptjs';
import '../src/models/index.js';
import { User } from '../src/models/index.js';

const seedAdmin = async () => {
  try {
    console.log('Seeding admin user...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@pustaklinu.com' } });
    
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping...');
      await sequelize.close();
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Create admin user with all required fields
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@pustaklinu.com',
      phone: '9800000000', // Required for profile completion
      password: hashedPassword,
      role: 'admin',
      address: 'Admin Office',
      city: 'Kathmandu',
      province: 'Bagmati',
      state: 'Bagmati',
      pincode: '44600',
      latitude: 27.7172,
      longitude: 85.3240,
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@pustaklinu.com');
    console.log('Password: Admin@123');
    
    await sequelize.close();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
