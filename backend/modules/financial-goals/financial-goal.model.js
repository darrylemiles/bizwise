import mongoose from 'mongoose';

const financialGoalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    targetAmount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    deadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },

    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

financialGoalSchema.index({
  status: 1,
  deadline: 1,
});

financialGoalSchema.index({
  createdBy: 1,
});

financialGoalSchema.index({
  account: 1,
});

const FinancialGoal = mongoose.model(
  'FinancialGoal',
  financialGoalSchema
);

export default FinancialGoal;