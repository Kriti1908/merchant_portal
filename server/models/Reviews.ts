import mongoose from 'mongoose';

const reviewsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: false // Change from required:true to required:false
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    avatar: {
        type: String, // Add avatar field
        required: false,
      },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Review = mongoose.model('Review', reviewsSchema);