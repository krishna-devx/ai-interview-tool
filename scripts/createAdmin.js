// scripts/create-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Define the Interviewer Schema with roles
const InterviewerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['ADMIN'],
    
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  collection:"INTERVIEWER"
});

// Create Interviewer model
const Interviewer = mongoose.models.Interviewer || mongoose.model('Interviewer', InterviewerSchema);

// Create admin function
async function createAdmin() {
  try {
    // Connect to MongoDB
    const MONGODB_URI =  "mongodb+srv://krishna:ULoNMiNgUf95uftK@ai-interviewer.dzxirhy.mongodb.net/?retryWrites=true&w=majority&appName=AI-interviewer";
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    
    
    // Default admin credentials (customize these with environment variables)
    const adminData = {
      name: process.env.ADMIN_NAME || 'Super Admin',
      email: process.env.ADMIN_EMAIL || 'interviewer@devx.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@1234',
      company: process.env.ADMIN_COMPANY || 'Interview AI Platform',
      position: 'Administrator',
      role: 'ADMIN'
    };
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);
    
    // Create the admin
    const admin = await Interviewer.create({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      company: adminData.company,
      position: adminData.position,
      role: adminData.role,
      lastLogin: null
    });
    
    console.log('Admin created successfully:');
    console.log({
      name: admin.name,
      email: admin.email,
      company: admin.company,
      role: admin.role,
      id: admin._id
    });
    console.log('\nYou can now log in with:');
    console.log(`Email: ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error creating admin:', error);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB due to error');
    }
    
    process.exit(1);
  }
}

// Run the function
createAdmin();

