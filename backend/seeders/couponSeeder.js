const connectDB = require('../config/database');
const Coupon = require('../models/Coupon');

const coupons = [
  {
    code: 'WELCOME10',
    title: 'Welcome Offer 10% OFF',
    description: 'Get 10% off on your first order',
    type: 'welcome',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 200,
    minOrderValue: 500,
    validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    usageLimit: null,
    usageCount: 0,
    userUsageLimit: 1,
    applicableCategories: [],
    applicableProducts: [],
    excludedProducts: [],
    userRestrictions: { newUsersOnly: false, premiumUsersOnly: false, specificUsers: [] },
    paymentMethods: [],
    isActive: true,
    priority: 10
  },
  {
    code: 'UPI50',
    title: 'UPI Flat Rs 50 OFF',
    description: 'Flat Rs 50 off on UPI payments',
    type: 'bank',
    discountType: 'fixed',
    discountValue: 50,
    minOrderValue: 300,
    validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    usageLimit: null,
    usageCount: 0,
    userUsageLimit: 3,
    applicableCategories: [],
    applicableProducts: [],
    excludedProducts: [],
    userRestrictions: { newUsersOnly: false, premiumUsersOnly: false, specificUsers: [] },
    paymentMethods: ['upi'],
    isActive: true,
    priority: 8
  },
  {
    code: 'LOYALTY100',
    title: 'Loyalty Flat Rs 100 OFF',
    description: 'Flat Rs 100 off for loyal customers',
    type: 'loyalty',
    discountType: 'fixed',
    discountValue: 100,
    minOrderValue: 800,
    validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    usageLimit: null,
    usageCount: 0,
    userUsageLimit: 2,
    applicableCategories: [],
    applicableProducts: [],
    excludedProducts: [],
    userRestrictions: { newUsersOnly: false, premiumUsersOnly: false, specificUsers: [] },
    paymentMethods: [],
    isActive: true,
    priority: 9
  }
];

const seedCoupons = async () => {
  try {
    const connected = await connectDB();
    if (!connected) {
      console.warn('MongoDB not connected. Aborting coupon seeding.');
      process.exit(1);
    }

    await Coupon.deleteMany({});
    console.log('Cleared existing coupons');

    await Coupon.insertMany(coupons);
    console.log(`Inserted ${coupons.length} coupons`);

    console.log('✅ Coupons seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding coupons:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedCoupons();
}

module.exports = seedCoupons;
