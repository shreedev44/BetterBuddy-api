const mongoose = require('mongoose');

const reflectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  weekStartDate: {
    type: Date,
    required: true,
  },
  weekEndDate: {
    type: Date,
    required: true,
  },
  customTaskReflections: [
    {
      target: String,
      input: String,
      completed: {
        type: Boolean,
        required: true,
      },
      explanation: String,
    },
  ],
  screenTimeReflection: {
    target: Number,
    completed: Boolean,
    explanation: String,
  },
  bodyMovementReflection: {
    completed: Boolean,
    explanation: String,
  },
  completionPercentage: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
reflectionSchema.index({ userId: 1, weekStartDate: 1 });

module.exports = mongoose.model('Reflection', reflectionSchema);

