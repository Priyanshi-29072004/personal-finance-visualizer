import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Education', 'Savings', 'Other'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  month: {
    type: Date,
    required: [true, 'Month is required'],
    default: Date.now
  },
  year: {
    type: Number,
    required: [true, 'Year is required']
  }
}, {
  timestamps: true
});

// Create a compound index for category and month to ensure unique budgets per category per month
BudgetSchema.index({ category: 1, month: 1 }, { unique: true });

const Budget = mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);

export default Budget; 