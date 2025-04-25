import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Transaction from '../../../models/Transaction';
import { CATEGORIES } from '../../../constants/categories';

// GET all transactions
export async function GET() {
  try {
    console.log('Attempting to connect to database...');
    await connectDB();
    console.log('Database connected, fetching transactions...');
    const transactions = await Transaction.find().sort({ date: -1 });
    console.log('Transactions fetched successfully:', transactions.length);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error in GET /api/transactions:', error);
    // Check if it's a MongoDB connection error
    if (error.name === 'MongoServerError' || error.name === 'MongoNetworkError') {
      return NextResponse.json(
        { error: 'Database connection error. Please try again later.' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

// POST new transaction
export async function POST(request) {
  try {
    console.log('Attempting to connect to database...');
    await connectDB();
    console.log('Database connected, processing request...');
    
    const data = await request.json();
    console.log('Received transaction data:', data);
    
    // Validate category
    if (data.category && !CATEGORIES.includes(data.category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }
    
    const transaction = await Transaction.create(data);
    console.log('Transaction created successfully:', transaction);
    
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/transactions:', error);
    // Check if it's a MongoDB connection error
    if (error.name === 'MongoServerError' || error.name === 'MongoNetworkError') {
      return NextResponse.json(
        { error: 'Database connection error. Please try again later.' },
        { status: 503 }
      );
    }
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
} 