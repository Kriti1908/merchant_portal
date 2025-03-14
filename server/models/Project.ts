import mongoose from 'mongoose';

const stateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  specification: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  }
});

const documentSchema = new mongoose.Schema({
  originalName: String,
  fileName: String,
  path: String,
  type: {
    type: String,
    enum: ['companyInfo', 'faq', 'products']
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  botName: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['Customer Support', 'Sales', 'Product Information', 'Technical Support']
  },
  documents: [documentSchema],
  states: [stateSchema],
  apiKey: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better query performance
projectSchema.index({ userId: 1 });
projectSchema.index({ apiKey: 1 }, { unique: true });

// Update lastUpdated timestamp before saving
projectSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

export const Project = mongoose.model('Project', projectSchema);