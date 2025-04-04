// src/models/Interviewer.js
import { COLLECTION_NAME, ROLES } from "@/lib/constants";
import mongoose from "mongoose";

const InterviewerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    position: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.INTERVIEWER
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME.INTERVIEWER,
  }
);

export default mongoose.models.Interviewer ||
  mongoose.model("Interviewer", InterviewerSchema);

// src/models/Interviewee.js
