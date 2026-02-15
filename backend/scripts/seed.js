const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Service = require('../models/Service');
const Order = require('../models/Order');
const Task = require('../models/Task');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/graphic_corner';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    await Order.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@graphiccorner.lk',
      password: 'admin123',
      role: 'admin'
    });

    const team1 = await User.create({
      name: 'Nimal Silva',
      email: 'nimal@graphiccorner.lk',
      password: 'team123',
      role: 'team',
      specialty: 'Video Editor'
    });

    const team2 = await User.create({
      name: 'Shalini Fernando',
      email: 'shalini@graphiccorner.lk',
      password: 'team123',
      role: 'team',
      specialty: 'Graphic Designer'
    });

    const customer1 = await User.create({
      name: 'Kasun Perera',
      email: 'kasun@example.com',
      password: 'customer123',
      role: 'customer',
      walletBalance: 50000
    });

    const customer2 = await User.create({
      name: 'Dilini Jayawardena',
      email: 'dilini@example.com',
      password: 'customer123',
      role: 'customer',
      walletBalance: 25000
    });

    console.log('👥 Created users');

    // Create Services
    const services = await Service.insertMany([
      {
        name: 'Logo Design',
        category: 'graphics',
        description: 'Professional logo design for your brand',
        priceRange: { min: 5000, max: 15000 },
        deliveryTime: '3-5 days',
        features: ['3 Concepts', '2 Revisions', 'Source Files'],
        isPopular: true
      },
      {
        name: 'Social Media Post',
        category: 'graphics',
        description: 'Eye-catching social media graphics',
        priceRange: { min: 1000, max: 3000 },
        deliveryTime: '1-2 days',
        features: ['Custom Design', '1 Revision', 'All Formats']
      },
      {
        name: 'YouTube Video Editing',
        category: 'video',
        description: 'Professional YouTube video editing',
        priceRange: { min: 5000, max: 20000 },
        deliveryTime: '3-7 days',
        features: ['Color Grading', 'Sound Design', 'Transitions'],
        isPopular: true
      },
      {
        name: 'Short Reel/TikTok',
        category: 'video',
        description: 'Engaging short-form video editing',
        priceRange: { min: 1500, max: 5000 },
        deliveryTime: '1-2 days',
        features: ['Trendy Effects', 'Music Sync', 'Captions']
      },
      {
        name: '3D Product Rendering',
        category: '3d',
        description: '3D visualization of your products',
        priceRange: { min: 10000, max: 30000 },
        deliveryTime: '5-10 days',
        features: ['Photorealistic', '4K Resolution', '3 Angles']
      },
      {
        name: 'AI Image Generation',
        category: 'ai',
        description: 'AI-powered custom image creation',
        priceRange: { min: 2000, max: 8000 },
        deliveryTime: '1-3 days',
        features: ['Multiple Variations', 'High Quality', 'Commercial Use']
      }
    ]);

    console.log('🎨 Created services');

    // Create Sample Orders
    const order1 = await Order.create({
      customer: customer1._id,
      service: services[0]._id,
      totalAmount: 10000,
      advanceAmount: 2500,
      status: 'in_progress',
      currentStep: 3,
      assignedTo: team2._id,
      requirements: 'Need a modern minimalist logo for tech startup'
    });

    const order2 = await Order.create({
      customer: customer1._id,
      service: services[2]._id,
      totalAmount: 15000,
      advanceAmount: 3750,
      status: 'review',
      currentStep: 4,
      assignedTo: team1._id,
      requirements: 'YouTube video about product review, 10 minutes',
      files: {
        watermark: ['https://example.com/preview.mp4']
      }
    });

    console.log('📦 Created orders');

    // Create Sample Tasks
    await Task.insertMany([
      {
        title: 'Edit YouTube Video - Product Review',
        description: 'Edit 10-minute product review video with transitions and effects',
        status: 'in_progress',
        priority: 'high',
        assignedTo: team1._id,
        order: order2._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Design Logo - Tech Startup',
        description: 'Create modern minimalist logo with 3 concept options',
        status: 'in_progress',
        priority: 'high',
        assignedTo: team2._id,
        order: order1._id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Create Social Media Graphics Pack',
        description: 'Design 10 Instagram posts for marketing campaign',
        status: 'todo',
        priority: 'medium',
        assignedTo: team2._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log('✅ Created tasks');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('Admin: admin@graphiccorner.lk / admin123');
    console.log('Team: nimal@graphiccorner.lk / team123');
    console.log('Customer: kasun@example.com / customer123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
