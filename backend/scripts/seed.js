const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Import models
const User = require('../models/User');
const Post = require('../models/Post');
const ChatRoom = require('../models/ChatRoom');

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await ChatRoom.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123456', 12);
    const admin = new User({
      username: 'admin',
      email: 'admin@roaldate.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isEmailVerified: true,
      isPhoneVerified: true,
      isTwoFactorEnabled: false,
    });
    await admin.save();
    console.log('👤 Created admin user');

    // Create test users
    const testUsers = [];
    const userNames = ['john_doe', 'jane_smith', 'mike_wilson', 'sarah_jones', 'alex_brown'];
    const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'Alex'];
    const lastNames = ['Doe', 'Smith', 'Wilson', 'Jones', 'Brown'];

    for (let i = 0; i < userNames.length; i++) {
      const password = await bcrypt.hash('password123', 12);
      const user = new User({
        username: userNames[i],
        email: `${userNames[i]}@example.com`,
        password: password,
        firstName: firstNames[i],
        lastName: lastNames[i],
        role: 'user',
        isEmailVerified: true,
        isPhoneVerified: true,
        isTwoFactorEnabled: false,
      });
      await user.save();
      testUsers.push(user);
    }
    console.log(`👥 Created ${testUsers.length} test users`);

    // Create sample posts
    const samplePosts = [
      'Welcome to RoalDate! 🎉',
      'Just had an amazing coffee at the new cafe downtown! ☕',
      'Beautiful sunset today! Who else loves sunsets? 🌅',
      'Working on a new project, so excited to share it soon! 💻',
      'Weekend vibes! Anyone up for a hike? 🥾',
    ];

    for (let i = 0; i < samplePosts.length; i++) {
      const post = new Post({
        author: testUsers[i % testUsers.length]._id,
        content: samplePosts[i],
        tags: ['welcome', 'coffee', 'sunset', 'project', 'weekend'].slice(i, i + 1),
        likes: [],
        comments: [],
        shares: 0,
      });
      await post.save();
    }
    console.log(`📝 Created ${samplePosts.length} sample posts`);

    // Create sample chat rooms
    const chatRooms = [
      { name: 'General Chat', type: 'group' },
      { name: 'Tech Talk', type: 'group' },
      { name: 'Random', type: 'group' },
    ];

    for (const roomData of chatRooms) {
      const chatRoom = new ChatRoom({
        name: roomData.name,
        type: roomData.type,
        createdBy: admin._id,
        participants: [admin._id, ...testUsers.slice(0, 3).map(u => u._id)],
        admins: [admin._id],
      });
      await chatRoom.save();
    }
    console.log(`💬 Created ${chatRooms.length} chat rooms`);

    console.log('🎉 Database seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log('Admin: admin@roaldate.com / admin123456');
    console.log('Test users: john_doe@example.com / password123');
    console.log('                jane_smith@example.com / password123');
    console.log('                mike_wilson@example.com / password123');
    console.log('                sarah_jones@example.com / password123');
    console.log('                alex_brown@example.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the seed function
seedData();
