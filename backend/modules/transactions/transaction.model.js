import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'income',
        'expense',
        'loan',
        'capital',
        'transfer',
      ],
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },

    destinationAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    reference: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
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

transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ account: 1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ createdBy: 1 });

const Transaction = mongoose.model(
  'Transaction',
  transactionSchema
);

export default Transaction;