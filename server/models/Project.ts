import mongoose from 'mongoose';

const stateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  utterances: {
    type: [String],
    required: true
  },
  responses: {
    type: [String],
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

// Add payment schema
const paymentSchema = new mongoose.Schema({
  paymentId: String,
  orderId: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  date: {
    type: Date,
    default: Date.now
  },
  amount: Number,
  currency: {
    type: String,
    default: 'INR'
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
  plan_type: {
    type: String,
    enum: ['Basic', 'Pro', 'Ultimate'],
    default: 'Basic'
  },
  plan_expiry: {
    type: Date,
    default: null
  },
  total_api_calls: {
    type: Number,
    default: 200
  },
  bot_link: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  payment: paymentSchema,
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

// Update lastUpdated and check plan expiry before saving
projectSchema.pre('save', function (next) {
  this.lastUpdated = new Date();

  // Automatically deactivate project if plan has expired
  if (this.plan_expiry && this.plan_expiry < new Date()) {
    this.isActive = false;
  }

  next();
});

export const Project = mongoose.model('Project', projectSchema);