// src/actions/questions.js
'use server'

import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/mongoose';
import FavQuestion from '@/models/FavQuestion';
import { getAuthUser } from './auth';

/**
 * Create new favorite question
 */
export async function createFavQuestion(prevState, formData) {
  try {
    const auth = await getAuthUser();
    
    if (!auth) {
      return { success: false, message: 'Authentication required' };
    }
    
    const question = formData.get('question');
    const category = formData.get('category');
    const difficultyLevel = formData.get('difficultyLevel');
    const tags = formData.get('tags')?.split(',').map(tag => tag.trim()) || [];
    const isPublic = formData.get('isPublic') === 'true';
    
    // Validate input
    if (!question || !category) {
      return { success: false, message: 'Please provide question text and category' };
    }
    
    await connectDB();
    
    const favQuestion = await FavQuestion.create({
      question,
      category,
      difficultyLevel,
      tags,
      isPublic,
      createdBy: auth.id
    });
    
    revalidatePath('/dashboard/questions');
    
    return { 
      success: true, 
      question: favQuestion.toObject() 
    };
    
  } catch (error) {
    console.error('Create question error:', error);
    return { success: false, message: 'Server error' };
  }
}

/**
 * Get all favorite questions for logged in interviewer
 */
export async function getFavQuestions() {
  try {
    const auth = await getAuthUser();
    
    if (!auth) {
      return [];
    }
    
    await connectDB();
    
    const questions = await FavQuestion.find({ createdBy: auth.id })
      .sort({ createdAt: -1 });
    
    return questions.map(question => question.toObject());
    
  } catch (error) {
    console.error('Get questions error:', error);
    return [];
  }
}

/**
 * Get public favorite questions
 */
export async function getPublicFavQuestions() {
  try {
    await connectDB();
    
    const questions = await FavQuestion.find({ isPublic: true })
      .sort({ createdAt: -1 });
    
    return questions.map(question => question.toObject());
    
  } catch (error) {
    console.error('Get public questions error:', error);
    return [];
  }
}

/**
 * Update a favorite question
 */


/**
 * Delete a favorite question
 */
export async function deleteFavQuestion(id) {
  try {
    const auth = await getAuthUser();
    
    if (!auth) {
      return { success: false, message: 'Authentication required' };
    }
    
    await connectDB();
    
    // Make sure the question belongs to this interviewer
    const existingQuestion = await FavQuestion.findOne({
      _id: id,
      createdBy: auth.id
    });
    
    if (!existingQuestion) {
      return { success: false, message: 'Question not found' };
    }
    
    await FavQuestion.findByIdAndDelete(id);
    
    revalidatePath('/dashboard/questions');
    
    return { success: true };
    
  } catch (error) {
    console.error('Delete question error:', error);
    return { success: false, message: 'Server error' };
  }
}