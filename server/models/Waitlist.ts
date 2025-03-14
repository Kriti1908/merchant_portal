import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export const Waitlist = mongoose.model('Waitlist', waitlistSchema);
