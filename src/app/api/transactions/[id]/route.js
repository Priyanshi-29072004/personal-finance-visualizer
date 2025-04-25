import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Transaction from '../../../../models/Transaction';

// GET single transaction
export async function GET(request, { params }) {
  try {
    await connectDB();
    const transaction = await Transaction.findById(params.id);
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE transaction
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Validate the data
    if (!data.amount || !data.date || !data.description || !data.category) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      params.id,
      {
        ...data,
        amount,
        date: new Date(data.date)
      },
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE transaction
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const transaction = await Transaction.findByIdAndDelete(params.id);
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 