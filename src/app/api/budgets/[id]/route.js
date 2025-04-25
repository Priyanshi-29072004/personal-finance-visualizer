import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Budget from '../../../../models/Budget';

// GET single budget
export async function GET(request, { params }) {
  try {
    await connectDB();
    const budget = await Budget.findById(params.id);
    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }
    return NextResponse.json(budget);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE budget
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Validate the data
    if (!data.amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      params.id,
      { amount },
      { new: true, runValidators: true }
    );

    if (!updatedBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    return NextResponse.json(updatedBudget);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE budget
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const budget = await Budget.findByIdAndDelete(params.id);
    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 