import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    type: {
      type: String,
      required: true,
      enum: ['cash', 'bank', 'e-wallet'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

accountSchema.index({
  name: 1,
});

const Account = mongoose.model('Account', accountSchema);

export default Account;