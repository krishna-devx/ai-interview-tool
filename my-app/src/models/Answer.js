// models/Answer.js
import mongoose from 'mongoose';
import { COLLECTION_NAME } from '@/lib/constants';

const AnswerSchema = new mongoose.Schema({
  interviewId: { 
    type: String, 
    required: true,
    index: true
  },
  questionIndex: { 
    type: Number, 
    required: true 
  },
  threadId: { 
    type: String, 
    required: true 
  },
  code: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true,
  collection: COLLECTION_NAME.ANSWERS 
});

// Create a compound index for faster lookups
AnswerSchema.index({ interviewId: 1, questionIndex: 1 }, { unique: true });

export default mongoose.models.Answer || 
  mongoose.model('Answer', AnswerSchema);