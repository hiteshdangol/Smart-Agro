const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Farmer = require('./models/Farmer');
const Role = require('./models/Role');
const dotenv = require('dotenv');
const path = require('path');
const { DEFAULT_ROLES } = require('./utils/permissions');

dotenv.config({ path: path.join(__dirname, '.env') });

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const roleCount = await Role.countDocuments();
    if (roleCount === 0) {
      await Role.insertMany(DEFAULT_ROLES);
      console.log('Default roles seeded');
    }

    const hash = await bcrypt.hash('admin123', 12);
    const admin = await Farmer.findOneAndUpdate(
      { email: 'admin@admin.com' },
      {
        name: 'Admin',
        email: 'admin@admin.com',
        password: hash,
        role: 'Admin',
      },
      { upsert: true, new: true }
    );

    console.log(`Admin ${admin.isNew ? 'created' : 'updated'}:`);
    console.log('  Email:    admin@admin.com');
    console.log('  Password: admin123');
    console.log('  Role:     Admin');
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
}

createAdmin();
