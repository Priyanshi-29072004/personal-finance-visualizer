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