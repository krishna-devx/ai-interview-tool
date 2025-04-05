// src/actions/interviews.js
'use server'

import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/mongoose';
import Interview from '@/models/Interview';
import Interviewee from '@/models/Interviewee';
import { getAuthUser } from './auth';
import { createInterviewBusiness } from './businessLogic';

/**
 * Create new interviewee
 */
export async function createInterviewee(prevState, formData) {
  try {
    const auth = await getAuthUser();
    
    if (!auth) {
      return { success: false, message: 'Authentication required' };
    }
    
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const position = formData.get('position');
    const experienceYears = parseInt(formData.get('experienceYears') || '0');
    const skills = formData.get('skills')?.split(',').map(skill => skill.trim()) || [];
    
    // Validate input
    if (!name || !email || !position) {
      return { success: false, message: 'Please provide name, email, and position' };
    }
    
    await connectDB();
    
    const interviewee = await Interviewee.create({
      name,
      email,
      phone,
      position,
      experienceYears,
      skills,
      createdBy: auth.id
    });
    
    revalidatePath('/dashboard/interviewees');
    
    return { 
      success: true, 
      interviewee: interviewee.toObject() 
    };
    
  } catch (error) {
    console.error('Create interviewee error:', error);
    return { success: false, message: 'Server error' };
  }
}

/**
 * Get all interviewees for logged in interviewer
 */
export async function getInterviewees() {
  try {
    const auth = await getAuthUser();
    
    if (!auth) {
      return [];
    }
    
    await connectDB();
    
    const interviewees = await Interviewee.find({ createdBy: auth.id })
      .sort({ createdAt: -1 });
    
    return interviewees.map(interviewee => interviewee.toObject());
    
  } catch (error) {
    console.error('Get interviewees error:', error);
    return [];
  }
}

/**
 * Create new interview
 */
export async function createInterview(formData) {
  try {
    const auth = await getAuthUser();
    
    if (!auth) {
      return { success: false, message: 'Authentication required' };
    }
    
    const intervieweeId = formData.get('intervieweeId');
    const startTime = new Date(formData.get('startTime'));
    
    // Validate input
    if (!intervieweeId || !startTime) {
      return { success: false, message: 'Please provide all required fields' };
    }
    
    await connectDB();
    
    await createInterviewBusiness(formData)
    
    // Verify the interviewee exists and belongs to this interviewer
    const interviewee = await Interviewee.findOne({
      _id: intervieweeId,
      createdBy: auth.id
    });
    
    if (!interviewee) {
      return { success: false, message: 'Interviewee not found' };
    }
    
    const interview = await Interview.create({
      interviewer: auth.id,
      interviewee: intervieweeId,
      startTime,
      status: 'scheduled'
    });

    createInterview()
    
    revalidatePath('/dashboard/interviews');
    
    return { 
      success: true, 
      interview: interview.toObject() 
    };
    
  } catch (error) {
    console.error('Create interview error:', error);
    return { success: false, message: 'Server error' };
  }
}

/**
 * Get all interviews for logged in interviewer
 */
export async function getInterviews() {
  try {
    const auth = await getAuthUser();
    
    if (!auth) {
      return [];
    }
    
    await connectDB();
    
    const interviews = await Interview.find({ interviewer: auth.id })
      .populate('interviewee', 'name email position')
      .sort({ startTime: -1 });
    
    return interviews.map(interview => interview.toObject());
    
  } catch (error) {
    console.error('Get interviews error:', error);
    return [];
  }
}

/**
 * Get single interview by ID
 */
export async function getInterview(id) {
  try {
    const auth = await getAuthUser();
    
    if (!auth) {
      return null;
    }
    
    await connectDB();
    
    const interview = await Interview.findOne({
      _id: id,
      interviewer: auth.id
    }).populate('interviewee');
    
    if (!interview) {
      return null;
    }
    
    return interview.toObject();
    
  } catch (error) {
    console.error('Get interview error:', error);
    return null;
  }
}

/**
 * Start an interview
 */
export async function startInterview(id) {
  try {
    const auth = await getAuthUser();
    
    if (!auth) {
      return { success: false, message: 'Authentication required' };
    }
    
    await connectDB();
    
    const interview = await Interview.findOne({
      _id: id,
      interviewer: auth.id
    });
    
    if (!interview) {
      return { success: false, message: 'Interview not found' };
    }
    
    if (interview.status !== 'scheduled') {
      return { success: false, message: `Interview is already ${interview.status}` };
    }
    
    interview.status = 'in-progress';
    interview.startTime = new Date(); // Update start time to actual time
    await interview.save();
    
    revalidatePath(`/dashboard/interviews/${id}`);
    revalidatePath('/dashboard/interviews');
    
    return { success: true };
    
  } catch (error) {
    console.error('Start interview error:', error);
    return { success: false, message: 'Server error' };
  }
}

/**
 * End an interview
 */
export async function endInterview(prevState, formData) {
  try {
    const auth = await getAuthUser();
    
    if (!auth) {
      return { success: false, message: 'Authentication required' };
    }
    
    const id = formData.get('id');
    const overallScore = parseFloat(formData.get('overallScore'));
    const feedback = formData.get('feedback');
    const recommendation = formData.get('recommendation');
    const notes = formData.get('notes');
    
    await connectDB();
    
    const interview = await Interview.findOne({
      _id: id,
      interviewer: auth.id
    });
    
    if (!interview) {
      return { success: false, message: 'Interview not found' };
    }
    
    if (interview.status !== 'in-progress') {
      return { success: false, message: `Interview cannot be ended because it is ${interview.status}` };
    }
    
    interview.status = 'completed';
    interview.endTime = new Date();
    interview.overallScore = overallScore;
    interview.feedback = feedback;
    interview.notes = notes;
    interview.recommendation = recommendation;
    
    await interview.save();
    
    revalidatePath(`/dashboard/interviews/${id}`);
    revalidatePath('/dashboard/interviews');
    
    return { success: true };
    
  } catch (error) {
    console.error('End interview error:', error);
    return { success: false, message: 'Server error' };
  }
}