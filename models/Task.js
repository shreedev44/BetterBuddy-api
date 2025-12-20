const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
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
  customTasks: [
    {
      target: {
        type: String,
        required: true,
      },
      input: {
        type: String,
        required: true,
      },
    },
  ],
  screenTimeTarget: {
    type: Number, // in hours
    default: null,
  },
  bodyMovement: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
taskSchema.index({ userId: 1, weekStartDate: 1 });

module.exports = mongoose.model('Task', taskSchema);

