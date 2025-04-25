import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Transaction from '../../../models/Transaction';

// GET all transactions
export async function GET() {
  try {
    await connectDB();
    const transactions = await Transaction.find().sort({ date: -1 });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST new transaction
export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const transaction = await Transaction.create(data);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 