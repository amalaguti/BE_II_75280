#!/usr/bin/env node

/**
 * Database seeding script
 * Creates an initial admin user for testing
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import userModel from './src/models/user.model.js';

const MONGO_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.vnuoakk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if admin user already exists
    const existingAdmin = await userModel.findOne({ email: 'admin@local' });
    
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists, skipping...');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.first_name} ${existingAdmin.last_name}`);
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Create admin user
    const adminUser = new userModel({
      first_name: 'Adrian',
      last_name: 'Malaguti',
      email: 'admin@local',
      age: 25,
      password: hashedPassword
    });
    
    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: 123456`);
    console.log(`   Name: ${adminUser.first_name} ${adminUser.last_name}`);
    
    // Show all users in database
    const allUsers = await userModel.find().select('-password');
    console.log('\n📋 All users in database:');
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.first_name} ${user.last_name})`);
    });
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding
seedDatabase(); 