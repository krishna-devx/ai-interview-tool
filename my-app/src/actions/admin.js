// src/actions/admin.js
'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongoose';
import Interviewer from '@/models/Interviewer';
import { ROLES } from '@/lib/constants';

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
    
    // Find admin in database (using Interviewer model with admin role)
    const admin = await Interviewer.findOne({ 
      email, 
      role: { $in: [ROLES.ADMIN] }
    });
    
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
    cookies().set('token', token, {
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
        role: user.role,
        company: user.company
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
    const role = formData.get('role') || 'interviewer';
    
    // Only superadmin can create other admins
    if ((role === 'admin' || role === 'superadmin') && auth.role !== 'superadmin') {
      return { success: false, message: 'Only superadmins can create admin accounts' };
    }
    
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
      role,
      lastLogin: null
    });
    
    return { 
      success: true, 
      interviewer: {
        id: interviewer._id,
        name: interviewer.name,
        email: interviewer.email,
        company: interviewer.company,
        position: interviewer.position,
        role: interviewer.role
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
    
    // Get all interviewers (users with interviewer role)
    const interviewers = await Interviewer.find({ role: 'interviewer' })
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
 * Get all admins (superadmin only)
 */


/**
 * Get all users (admin only)
 */


/**
 * Update user (admin only)
 */
export async function updateUser(prevState, formData) {
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
    const role = formData.get('role');
    const password = formData.get('password'); // Optional
    
    // Validate input
    if (!id || !name || !email || !company) {
      return { success: false, message: 'Please provide all required fields' };
    }
    
    await connectDB();
    
    // Get the user to update
    const userToUpdate = await Interviewer.findById(id);
    
    if (!userToUpdate) {
      return { success: false, message: 'User not found' };
    }
    
    // Only superadmin can update another admin or change role to admin
    if (auth.role !== 'superadmin') {
      if (userToUpdate.role !== 'interviewer' || (role && role !== 'interviewer')) {
        return { success: false, message: 'You do not have permission to update admin accounts or change roles' };
      }
    }
    
    // Check if email is already used by another user
    const existingUser = await Interviewer.findOne({ 
      email, 
      _id: { $ne: id } 
    });
    
    if (existingUser) {
      return { success: false, message: 'Email already registered by another user' };
    }
    
    // Prepare update data
    const updateData = {
      name,
      email,
      company,
      position
    };
    
    // Update role if provided and allowed
    if (role) {
      updateData.role = role;
    }
    
    // If password is provided, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    // Update user
    const updatedUser = await Interviewer.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return { success: false, message: 'User not found' };
    }
    
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${id}`);
    
    return { 
      success: true, 
      user: updatedUser.toObject()
    };
    
  } catch (error) {
    console.error('Update user error:', error);
    return { success: false, message: 'Server error' };
  }
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(id) {
  try {
    // Verify admin auth
    const auth = await getAuthAdmin();
    
    if (!auth) {
      return { success: false, message: 'Admin authentication required' };
    }
    
    if (!id) {
      return { success: false, message: 'User ID is required' };
    }
    
    await connectDB();
    
    // Get the user to delete
    const userToDelete = await Interviewer.findById(id);
    
    if (!userToDelete) {
      return { success: false, message: 'User not found' };
    }
    
    // Only superadmin can delete admin accounts
    if (userToDelete.role !== 'interviewer' && auth.role !== 'superadmin') {
      return { success: false, message: 'You do not have permission to delete admin accounts' };
    }
    
    // Cannot delete your own account
    if (userToDelete._id.toString() === auth.id) {
      return { success: false, message: 'You cannot delete your own account' };
    }
    
    // Delete user
    const result = await Interviewer.findByIdAndDelete(id);
    
    if (!result) {
      return { success: false, message: 'User not found' };
    }
    
    revalidatePath('/admin/users');
    
    return { success: true };
    
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, message: 'Server error' };
  }
}

/**
 * Get currently authenticated admin
 */
export async function getAuthAdmin() {
  try {
    const token = cookies().get('token')?.value;
    
    if (!token) {
      return null;
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded || !decoded.role || !['admin', 'superadmin'].includes(decoded.role)) {
      return null;
    }
    
    await connectDB();
    
    const admin = await Interviewer.findById(decoded.id).select('-password');
    
    if (!admin || !['admin', 'superadmin'].includes(admin.role)) {
      return null;
    }
    
    return {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      company: admin.company
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
  cookies().delete('token');
  redirect('/login');
}

