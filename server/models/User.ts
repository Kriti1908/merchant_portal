import mongoose from 'mongoose';
import { number, z } from 'zod';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => /^[a-zA-Z0-9_]+$/.test(v),
      message: (props) => `${props.value} is not a valid username!`
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  },
  phone_no: {
    type: String, // Changed from number to String
    required: true,
    validate: {
      validator: (v) => /^[0-9]{10}$/.test(v), // Ensures it's a valid 10-digit number
      message: (props) => `${props.value} is not a valid phone number!`
    }
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