const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

const vendors = [
  { name: 'Acme Supplies', email: 'vendor1@example.com', password: 'Vendor@123', phone: '9000000001' },
  { name: 'TechBazaar', email: 'vendor2@example.com', password: 'Vendor@123', phone: '9000000002' },
  { name: 'GadgetHub', email: 'vendor3@example.com', password: 'Vendor@123', phone: '9000000003' }
];

const seedVendors = async () => {
  try {
    const connected = await connectDB();
    if (!connected) {
      console.error('MongoDB not connected. Aborting vendor seeding.');
      process.exit(1);
    }

    // Create or update vendors with role 'seller'
    for (const v of vendors) {
      const existing = await User.findOne({ email: v.email.toLowerCase() });
      if (existing) {
        console.log(`ℹ️ Vendor already exists: ${v.email}`);
        if (existing.role !== 'seller') {
          existing.role = 'seller';
          await existing.save();
          console.log(`✅ Updated role to seller for ${v.email}`);
        }
        continue;
      }

      const user = await User.create({
        name: v.name,
        email: v.email,
        password: v.password, // hashed by pre-save hook
        phone: v.phone,
        role: 'seller',
        isVerified: true
      });

      console.log(`✅ Created vendor: ${user.email}`);
    }

    console.log('🎉 Vendor seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding vendors:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  seedVendors();
}

module.exports = seedVendors;
