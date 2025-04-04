
import { COLLECTION_NAME } from '@/lib/constants';
import mongoose from 'mongoose';
const IntervieweeSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    phone: {
      type: String,
      trim: true
    },
    resume: {
      type: String,  // URL to resume file
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true
    },
    experienceLevel: {
      type: String,
      default: "Easy"
    },
    skills: [{
      type: String,
      trim: true
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interviewer',
      required: true
    }
  }, {
    timestamps: true,
    collection:COLLECTION_NAME.INTERVIEWEE
  });
  
  export default mongoose.models.Interviewee || mongoose.model('Interviewee', IntervieweeSchema);