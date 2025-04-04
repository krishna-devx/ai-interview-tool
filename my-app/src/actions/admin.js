// src/actions/admin.js
'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongoose';
import Admin from '@/models/Admin';
import Interviewer from '@/models/Interviewer';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

/**
 * Generate a JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

/**
 * Admin login action
 */
export async function loginAdmin(prevState, formData) {
  try {
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Validate input
    if (!email || !password) {
      return { success: false, message: 'Please provide email and password' };
    }
    
    await connectDB();
    
    // Find admin in database
    const admin = await Admin.findOne({ email });
    
    // Check if admin exists
    if (!admin) {
      return { success: false, message: 'Invalid credentials' };
    }
    
    // Check if password matches
    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
      return { success: false, message: 'Invalid credentials' };
    }
    
    // Update last login time
    admin.lastLogin = new Date();
    await admin.save();
    
    // Generate JWT token
    const token = generateToken({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    });
    
    // Save token in cookies
    cookies().set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });
    
    // Return user data (without password)
    const user = admin.toObject();
    delete user.password;
    
    return { 
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
    
  } catch (error) {
    console.error('Admin login error:', error);
    return { success: false, message: 'Server error' };
  }
}

/**
 * Create new Interviewer by Admin
 */
export async function createInterviewer(prevState, formData) {
  try {
    // Verify admin auth
    const auth = await getAuthAdmin();
    
    if (!auth) {
      return { success: false, message: 'Admin authentication required' };
    }
    
    // Get form data
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const company = formData.get('company');
    const position = formData.get('position') || '';
    
    // Validate input
    if (!name || !email || !password || !company) {
      return { success: false, message: 'Please provide all required fields' };
    }
    
    await connectDB();
    
    // Check if interviewer already exists
    const existingInterviewer = await Interviewer.findOne({ email });
    
    if (existingInterviewer) {
      return { success: false, message: 'Email already registered' };
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new interviewer
    const interviewer = await Interviewer.create({
      name,
      email,
      password: hashedPassword,
      company,
      position,
      lastLogin: null
    });
    
    return { 
      success: true, 
      interviewer: {
        id: interviewer._id,
        name: interviewer.name,
        email: interviewer.email,
        company: interviewer.company,
        position: interviewer.position
      }
    };
    
  } catch (error) {
    console.error('Create interviewer error:', error);
    return { success: false, message: 'Server error' };
  }
}

/**
 * Get all interviewers (admin only)
 */
export async function getAllInterviewers() {
  try {
    // Verify admin auth
    const auth = await getAuthAdmin();
    
    if (!auth) {
      return { success: false, message: 'Admin authentication required', interviewers: [] };
    }
    
    await connectDB();
    
    // Get all interviewers
    const interviewers = await Interviewer.find({})
      .select('-password')
      .sort({ createdAt: -1 });
    
    return { 
      success: true, 
      interviewers: interviewers.map(interviewer => interviewer.toObject()) 
    };
    
  } catch (error) {
    console.error('Get all interviewers error:', error);
    return { success: false, message: 'Server error', interviewers: [] };
  }
}

/**
 * Update interviewer (admin only)
 */
export async function updateInterviewer(prevState, formData) {
  try {
    // Verify admin auth
    const auth = await getAuthAdmin();
    
    if (!auth) {
      return { success: false, message: 'Admin authentication required' };
    }
    
    const id = formData.get('id');
    const name = formData.get('name');
    const email = formData.get('email');
    const company = formData.get('company');
    const position = formData.get('position') || '';
    const password = formData.get('password'); // Optional
    
    // Validate input
    if (!id || !name || !email || !company) {
      return { success: false, message: 'Please provide all required fields' };
    }
    
    await connectDB();
    
    // Check if email is already used by another interviewer
    const existingInterviewer = await Interviewer.findOne({ 
      email, 
      _id: { $ne: id } 
    });
    
    if (existingInterviewer) {
      return { success: false, message: 'Email already registered by another interviewer' };
    }
    
    // Prepare update data
    const updateData = {
      name,
      email,
      company,
      position
    };
    
    // If password is provided, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    // Update interviewer
    const interviewer = await Interviewer.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!interviewer) {
      return { success: false, message: 'Interviewer not found' };
    }
    
    return { 
      success: true, 
      interviewer: interviewer.toObject()
    };
    
  } catch (error) {
    console.error('Update interviewer error:', error);
    return { success: false, message: 'Server error' };
  }
}

/**
 * Delete interviewer (admin only)
 */
export async function deleteInterviewer(id) {
  try {
    // Verify admin auth
    const auth = await getAuthAdmin();
    
    if (!auth) {
      return { success: false, message: 'Admin authentication required' };
    }
    
    if (!id) {
      return { success: false, message: 'Interviewer ID is required' };
    }
    
    await connectDB();
    
    // Delete interviewer
    const result = await Interviewer.findByIdAndDelete(id);
    
    if (!result) {
      return { success: false, message: 'Interviewer not found' };
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Delete interviewer error:', error);
    return { success: false, message: 'Server error' };
  }
}

/**
 * Get currently authenticated admin
 */
export async function getAuthAdmin() {
  try {
    const token = cookies().get('admin_token')?.value;
    
    if (!token) {
      return null;
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded || !decoded.role || !['admin', 'superadmin'].includes(decoded.role)) {
      return null;
    }
    
    await connectDB();
    
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      return null;
    }
    
    return {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    };
    
  } catch (error) {
    console.error('Admin auth verification error:', error);
    return null;
  }
}

/**
 * Admin logout action
 */
export async function logoutAdmin() {
  cookies().delete('admin_token');
  redirect('/admin/login');
}

/**
 * Create initial admin if none exists
 * This should be used only once during initial setup
 */
export async function createInitialAdmin(adminData) {
  try {
    await connectDB();
    
    // Check if any admin exists
    const adminCount = await Admin.countDocuments();
    
    if (adminCount > 0) {
      return { success: false, message: 'Admin already exists' };
    }
    
    // Create initial admin
    const { name, email, password } = adminData;
    
    if (!name || !email || !password) {
      return { success: false, message: 'Please provide all required fields' };
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create superadmin
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: 'superadmin',
      lastLogin: new Date()
    });
    
    return { 
      success: true, 
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    };
    
  } catch (error) {
    console.error('Create initial admin error:', error);
    return { success: false, message: 'Server error' };
  }
}