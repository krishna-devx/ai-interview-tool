// models/FeedbackRequest.js
import mongoose from 'mongoose';
import { COLLECTION_NAME } from '@/lib/constants';

const FeedbackRequestSchema = new mongoose.Schema({
  interviewId: { 
    type: String, 
    required: true 
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
  feedback: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true,
  collection: COLLECTION_NAME.FEEDBACK_REQUESTS 
});

export default mongoose.models.FeedbackRequest || 
  mongoose.model('FeedbackRequest', FeedbackRequestSchema);