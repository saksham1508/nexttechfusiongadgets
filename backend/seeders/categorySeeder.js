const mongoose = require('mongoose');
const Category = require('../models/Category');
const connectDB = require('../config/database');

const categories = [
  {
    name: 'Electronics',
    description: 'Latest electronic gadgets and devices',
    level: 0,
    sortOrder: 1,
    seoTitle: 'Electronics - Latest Gadgets & Devices',
    seoDescription: 'Shop the latest electronics including smartphones, laptops, tablets, and more.',
    seoKeywords: ['electronics', 'gadgets', 'devices', 'technology'],
    attributes: [
      {
        name: 'Brand',
        type: 'select',
        options: ['Apple', 'Samsung', 'Google', 'Microsoft', 'Sony', 'LG'],
        required: true
      },
      {
        name: 'Warranty',
        type: 'select',
        options: ['1 year', '2 years', '3 years', 'Extended'],
        required: false
      }
    ]
  },
  {
    name: 'Smartphones',
    description: 'Latest smartphones and mobile devices',
    parent: null, // Will be set to Electronics ID
    level: 1,
    sortOrder: 1,
    seoTitle: 'Smartphones - Latest Mobile Phones',
    seoDescription: 'Discover the latest smartphones with cutting-edge features and technology.',
    seoKeywords: ['smartphones', 'mobile phones', 'android', 'iphone'],
    attributes: [
      {
        name: 'Storage',
        type: 'select',
        options: ['64GB', '128GB', '256GB', '512GB', '1TB'],
        required: true
      },
      {
        name: 'RAM',
        type: 'select',
        options: ['4GB', '6GB', '8GB', '12GB', '16GB'],
        required: true
      },
      {
        name: 'Screen Size',
        type: 'select',
        options: ['5.5"', '6.1"', '6.4"', '6.7"', '6.9"'],
        required: false
      }
    ]
  },
  {
    name: 'Laptops',
    description: 'High-performance laptops and notebooks',
    parent: null, // Will be set to Electronics ID
    level: 1,
    sortOrder: 2,
    seoTitle: 'Laptops - High Performance Computers',
    seoDescription: 'Shop high-performance laptops for work, gaming, and everyday use.',
    seoKeywords: ['laptops', 'notebooks', 'computers', 'gaming laptops'],
    attributes: [
      {
        name: 'Processor',
        type: 'select',
        options: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9'],
        required: true
      },
      {
        name: 'RAM',
        type: 'select',
        options: ['8GB', '16GB', '32GB', '64GB'],
        required: true
      },
      {
        name: 'Storage Type',
        type: 'select',
        options: ['SSD', 'HDD', 'Hybrid'],
        required: true
      },
      {
        name: 'Screen Size',
        type: 'select',
        options: ['13"', '14"', '15"', '16"', '17"'],
        required: false
      }
    ]
  },
  {
    name: 'Tablets',
    description: 'Tablets and e-readers for entertainment and productivity',
    parent: null, // Will be set to Electronics ID
    level: 1,
    sortOrder: 3,
    seoTitle: 'Tablets - Portable Computing Devices',
    seoDescription: 'Explore our range of tablets perfect for work, entertainment, and creativity.',
    seoKeywords: ['tablets', 'ipad', 'android tablets', 'e-readers'],
    attributes: [
      {
        name: 'Screen Size',
        type: 'select',
        options: ['7"', '8"', '10"', '11"', '12.9"'],
        required: true
      },
      {
        name: 'Storage',
        type: 'select',
        options: ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'],
        required: true
      },
      {
        name: 'Connectivity',
        type: 'multiselect',
        options: ['WiFi', 'Cellular', 'Bluetooth', 'USB-C'],
        required: false
      }
    ]
  },
  {
    name: 'Smartwatches',
    description: 'Smart wearables and fitness trackers',
    parent: null, // Will be set to Electronics ID
    level: 1,
    sortOrder: 4,
    seoTitle: 'Smartwatches - Wearable Technology',
    seoDescription: 'Stay connected with our collection of smartwatches and fitness trackers.',
    seoKeywords: ['smartwatches', 'fitness trackers', 'wearables', 'apple watch'],
    attributes: [
      {
        name: 'Compatibility',
        type: 'multiselect',
        options: ['iOS', 'Android', 'Windows'],
        required: true
      },
      {
        name: 'Features',
        type: 'multiselect',
        options: ['Heart Rate Monitor', 'GPS', 'Water Resistant', 'Sleep Tracking', 'NFC Payment'],
        required: false
      }
    ]
  },
  {
    name: 'Audio',
    description: 'Headphones, speakers, and audio equipment',
    parent: null, // Will be set to Electronics ID
    level: 1,
    sortOrder: 5,
    seoTitle: 'Audio Equipment - Headphones & Speakers',
    seoDescription: 'Premium audio equipment including headphones, earbuds, and speakers.',
    seoKeywords: ['headphones', 'speakers', 'audio', 'wireless earbuds'],
    attributes: [
      {
        name: 'Type',
        type: 'select',
        options: ['Over-ear', 'On-ear', 'In-ear', 'Earbuds'],
        required: true
      },
      {
        name: 'Connectivity',
        type: 'select',
        options: ['Wired', 'Wireless', 'Bluetooth', 'USB'],
        required: true
      },
      {
        name: 'Features',
        type: 'multiselect',
        options: ['Noise Cancelling', 'Water Resistant', 'Fast Charging', 'Voice Assistant'],
        required: false
      }
    ]
  },
  {
    name: 'Gaming',
    description: 'Gaming consoles, accessories, and peripherals',
    parent: null, // Will be set to Electronics ID
    level: 1,
    sortOrder: 6,
    seoTitle: 'Gaming - Consoles & Accessories',
    seoDescription: 'Gaming consoles, controllers, and accessories for the ultimate gaming experience.',
    seoKeywords: ['gaming', 'consoles', 'controllers', 'gaming accessories'],
    attributes: [
      {
        name: 'Platform',
        type: 'select',
        options: ['PlayStation', 'Xbox', 'Nintendo', 'PC', 'Mobile'],
        required: true
      },
      {
        name: 'Type',
        type: 'select',
        options: ['Console', 'Controller', 'Headset', 'Keyboard', 'Mouse'],
        required: true
      }
    ]
  },
  {
    name: 'Cameras',
    description: 'Digital cameras and photography equipment',
    parent: null, // Will be set to Electronics ID
    level: 1,
    sortOrder: 7,
    seoTitle: 'Cameras - Digital Photography Equipment',
    seoDescription: 'Professional and consumer digital cameras, lenses, and photography accessories.',
    seoKeywords: ['cameras', 'photography', 'lenses', 'dslr', 'mirrorless'],
    attributes: [
      {
        name: 'Type',
        type: 'select',
        options: ['DSLR', 'Mirrorless', 'Point & Shoot', 'Action Camera', 'Instant Camera'],
        required: true
      },
      {
        name: 'Resolution',
        type: 'select',
        options: ['12MP', '16MP', '20MP', '24MP', '32MP', '45MP+'],
        required: false
      }
    ]
  },
  {
    name: 'Accessories',
    description: 'Tech accessories and peripherals',
    parent: null, // Will be set to Electronics ID
    level: 1,
    sortOrder: 8,
    seoTitle: 'Tech Accessories - Cables, Cases & More',
    seoDescription: 'Essential tech accessories including cables, cases, chargers, and more.',
    seoKeywords: ['accessories', 'cables', 'cases', 'chargers', 'tech accessories'],
    attributes: [
      {
        name: 'Type',
        type: 'select',
        options: ['Cable', 'Case', 'Charger', 'Stand', 'Mount', 'Adapter'],
        required: true
      },
      {
        name: 'Compatibility',
        type: 'multiselect',
        options: ['iPhone', 'Android', 'iPad', 'Laptop', 'Universal'],
        required: false
      }
    ]
  }
];

const seedCategories = async () => {
  try {
    await connectDB();
    
    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');
    
    // Create Electronics parent category first
    const electronicsCategory = await Category.create(categories[0]);
    console.log('Created Electronics category');
    
    // Create subcategories with Electronics as parent
    const subcategories = categories.slice(1).map(cat => ({
      ...cat,
      parent: electronicsCategory._id
    }));
    
    const createdSubcategories = await Category.insertMany(subcategories);
    console.log(`Created ${createdSubcategories.length} subcategories`);
    
    // Update Electronics category with children
    electronicsCategory.children = createdSubcategories.map(cat => cat._id);
    await electronicsCategory.save();
    
    console.log('✅ Categories seeded successfully!');
    console.log(`Total categories created: ${1 + createdSubcategories.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedCategories();
}

module.exports = seedCategories;