// src/actions/auth.js
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongoose";
import Interviewer from "@/models/Interviewer";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";

/**
 * Generate a JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Interviewer login action
 */
export async function loginInterviewer(formData) {
  try {
    const email = formData.get("email");
    const password = formData.get("password");

    // Validate input
    if (!email || !password) {
      return { success: false, message: "Please provide email and password" };
    }

    await connectDB();

    // Find interviewer in database
    const interviewer = await Interviewer.findOne({ email });

    // Check if interviewer exists
    if (!interviewer) {
      return { success: false, message: "Invalid credentials" };
    }

    // Check if password matches (we need to hash and compare manually since we removed the schema method)
    const isMatch = await bcrypt.compare(password, interviewer.password);

    if (!isMatch) {
      return { success: false, message: "Invalid credentials" };
    }

    // Update last login time
    interviewer.lastLogin = new Date();
    await interviewer.save();

    // Generate JWT token

    // Return user data (without password)
    const user = interviewer.toObject();
    delete user.password;

    // For client-side usage (localStorage)
    return {
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        company: user.company,
        position: user.position,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Server error" };
  }
}

/**
 * Interviewer registration action
 */
export async function registerInterviewer(prevState, formData) {
  try {
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const company = formData.get("company");
    const position = formData.get("position") || "";

    // Validate input
    if (!name || !email || !password || !company) {
      return { success: false, message: "Please provide all required fields" };
    }

    await connectDB();

    // Check if interviewer already exists
    const existingInterviewer = await Interviewer.findOne({ email });

    if (existingInterviewer) {
      return { success: false, message: "Email already registered" };
    }

    // Hash password manually since we removed the schema method
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new interviewer
    const interviewer = await Interviewer.create({
      name,
      email,
      password: hashedPassword,
      company,
      position,
      lastLogin: new Date(),
    });

    // Generate JWT token
    const token = generateToken({
      id: interviewer._id,
      name: interviewer.name,
      email: interviewer.email,
      role: "interviewer",
    });

    // Save token in cookies
    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    // Return user data (without password)
    const user = interviewer.toObject();
    delete user.password;

    return {
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        position: user.position,
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Server error" };
  }
}

/**
 * Logout action
 */
export async function logout() {
  cookies().delete("token");
  redirect("/login");
}

/**
 * Verify token and get user info
 */
export async function getAuthUser() {
  try {
    const token = cookies().get("token")?.value;

    if (!token) {
      return null;
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    await connectDB();

    const user = await Interviewer.findById(decoded.id).select("-password");

    if (!user) {
      return null;
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      company: user.company,
      position: user.position,
      role: "interviewer",
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}
