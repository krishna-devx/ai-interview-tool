import mongoose from 'mongoose';
import { COLLECTION_NAME } from '@/lib/constants';

const QuestionSchema = new mongoose.Schema({
 interviewId: { 
   type: String, 
   required: true 
 },
 questionIndex: { 
   type: Number, 
   required: true 
 },
 question: { 
   type: String, 
   required: true 
 },
 status: { 
   type: String, 
   enum: ['pending', 'active', 'completed'], 
   default: 'pending' 
 },
 threadId: { 
   type: String, 
   required: true 
 },
 startedAt: { 
   type: Date, 
   default: Date.now 
 },
 createdAt: { 
   type: Date, 
   default: Date.now 
 }
}, { 
 timestamps: true,
 collection: COLLECTION_NAME.QUESTIONS 
});

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);