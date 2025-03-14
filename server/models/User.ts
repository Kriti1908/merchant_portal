import mongoose from 'mongoose';
import { z } from 'zod';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  },
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpiry: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ resetToken: 1 });

export const User = mongoose.model('User', userSchema);