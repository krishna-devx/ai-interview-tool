import { COLLECTION_NAME } from '@/lib/constants';
import mongoose from 'mongoose';

const InterviewSchema = new mongoose.Schema({
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interviewer',
    required: true
  },
  interviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interviewee',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'canceled'],
    default: 'scheduled'
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String
    },
    score: {
      type: Number,
      min: 0,
      max: 10
    },
    feedback: {
      type: String
    }
  }],
  overallScore: {
    type: Number,
    min: 0,
    max: 10
  },
  feedback: {
    type: String
  },
  notes: {
    type: String
  },
  recommendation: {
    type: String,
    enum: ['hire', 'reject', 'consider', 'pending'],
    default: 'pending'
  }
}, {
  timestamps: true,
  collection:COLLECTION_NAME.INTERVIEW
});

export default mongoose.models.Interview || mongoose.model('Interview', InterviewSchema);